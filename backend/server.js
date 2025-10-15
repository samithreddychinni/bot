import { GoogleGenAI, Type } from '@google/genai';
import { ChromaClient } from 'chromadb';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import cron from 'node-cron';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const AUTHORIZED_NUMBER = process.env.AUTHORIZED_NUMBER; // Your personal phone number
const PORT = process.env.PORT || 3001;
const IS_RENDER_ENV = !!process.env.RENDER;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PATHS CONFIGURATION ---
// In a unified setup, the server runs from /backend, so we go up one level for the root
const projectRoot = path.join(__dirname, '..'); 
const frontendDistPath = projectRoot; // Assuming index.html is at the root
const CHROMA_DB_PATH = IS_RENDER_ENV ? undefined : path.join(projectRoot, "chroma_data");
const AUTH_DATA_PATH = IS_RENDER_ENV ? undefined : path.join(projectRoot, 'session_data');

const BOT_PREFIXES = ['✅', '🧠', '🤖', '*Good Morning! ☀️*'];

// --- STATE MANAGEMENT ---
let whatsAppStatus = 'initializing'; // 'initializing', 'unscanned', 'connected', 'disconnected'
let qrDataURL = null;
let AUTHORIZED_NUMBER_SERIALIZED = null;

// --- INITIALIZATION ---
if (!GEMINI_API_KEY || !AUTHORIZED_NUMBER) {
    console.error("Missing GOOGLE_API_KEY or AUTHORIZED_NUMBER. Please check your .env file or Render environment variables.");
    // Don't exit on Render, as env vars are loaded differently
    if (!IS_RENDER_ENV) process.exit(1);
} else {
    AUTHORIZED_NUMBER_SERIALIZED = `${AUTHORIZED_NUMBER}@c.us`;
    console.log(`Security Notice: Bot will only respond to ${AUTHORIZED_NUMBER_SERIALIZED}`);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const chromaClient = IS_RENDER_ENV ? new ChromaClient() : new ChromaClient({ path: CHROMA_DB_PATH });

if (IS_RENDER_ENV) {
    console.warn("WARNING: Running in Render environment without a persistent disk.");
    console.warn("ChromaDB and WhatsApp session data will be ephemeral and lost on restart.");
}

let memoryCollection;
const app = express();

// --- API SERVER SETUP ---
app.use(cors());
app.use(express.json());

// Serve API routes under /api
const apiRouter = express.Router();
app.use('/api', apiRouter);

// --- WHATSAPP CLIENT SETUP ---
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: AUTH_DATA_PATH }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

client.on('qr', async (qr) => {
    console.log('QR code received, please scan in terminal or on the web UI:');
    qrcodeTerminal.generate(qr, { small: true });
    try {
        qrDataURL = await qrcode.toDataURL(qr);
        whatsAppStatus = 'unscanned';
    } catch (err) {
        console.error('Failed to generate QR data URL', err);
    }
});

client.on('ready', async () => {
    console.log('Client is ready!');
    whatsAppStatus = 'connected';
    qrDataURL = null;
    
    try {
        memoryCollection = await chromaClient.getOrCreateCollection({ name: "memory" });
        console.log("Memory vector collection is ready.");
    } catch (error) {
        console.error("Fatal error: Could not get or create memory collection.", error);
        if (!IS_RENDER_ENV) process.exit(1);
    }
    
    console.log(`Assistant is running on number: ${client.info.wid._serialized}`);

    cron.schedule('0 7 * * *', () => {
        console.log('Running scheduled daily digest for authorized user...');
        sendDailyDigest(AUTHORIZED_NUMBER_SERIALIZED);
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log(`Daily digest scheduled for 7:00 AM IST to be sent to ${AUTHORIZED_NUMBER}.`);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    whatsAppStatus = 'disconnected';
    qrDataURL = null;
});

client.on('message', async (message) => {
    const chat = await message.getChat();
    if (chat.isGroup) return;
    if (message.from !== AUTHORIZED_NUMBER_SERIALIZED) return;
    if (!message.body || BOT_PREFIXES.some(prefix => message.body.startsWith(prefix))) return;

    console.log(`Received authorized message: "${message.body}"`);
    const intent = await recognizeIntent(message.body);
    console.log(`Recognized intent: ${intent.type}`);

    const recipientId = AUTHORIZED_NUMBER_SERIALIZED;
    switch (intent.type) {
        case 'note':
            await saveToMemory(intent.content);
            client.sendMessage(recipientId, `✅ Note saved.`);
            break;
        case 'question':
            const answer = await answerQuestion(intent.content);
            client.sendMessage(recipientId, `🧠 ${answer}`);
            break;
        case 'digest_request':
            await sendDailyDigest(recipientId);
            break;
        default:
            const chatResponse = await getGenericChatResponse(intent.content);
            client.sendMessage(recipientId, `🤖 ${chatResponse}`);
            break;
    }
});

// --- API ENDPOINTS ---
apiRouter.post('/chat', async (req, res) => {
    const { history, message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    try {
        const responseText = await getWebChatResponse(history || [], message);
        res.json({ reply: responseText });
    } catch (error) {
        console.error('API chat error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

apiRouter.get('/whatsapp/status', (req, res) => {
    res.json({ status: whatsAppStatus, qr: qrDataURL });
});

apiRouter.post('/whatsapp/disconnect', async (req, res) => {
    if (whatsAppStatus === 'connected') {
        await client.logout();
        res.status(200).json({ message: 'Successfully disconnected.' });
    } else {
        res.status(400).json({ message: 'Client is not connected.' });
    }
});

// --- SERVE FRONTEND ---
app.use(express.static(frontendDistPath));

// For any route not matched by API or static files, serve the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});


// --- CORE FUNCTIONS (omitted for brevity, no changes from previous version) ---
async function getWebChatResponse(history, newMessage) {
    const contents = [...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    })), { role: 'user', parts: [{ text: newMessage }] }];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
              systemInstruction: "You are a helpful personal assistant for a college student. Your name is Brainy. Keep responses concise and helpful. You help with reminders, notes, and answering questions based on stored memories.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for web chat:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
}

async function recognizeIntent(userInput) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following user input and determine the intent. The user input is: "${userInput}". Your response must be a JSON object.`,
            config: {
                responseMimeType: "application/json",
                systemInstruction: `You are an intent recognition system. You must classify the user's input into one of four types: 'note', 'question', 'digest_request', or 'unknown'.
                - If the input starts with 'note:', 'save:', or 'remember:', the type is 'note'. The content is everything after the prefix.
                - If the input asks a question (starts with who, what, where, when, why, how, or ends with a '?'), the type is 'question'. The content is the full input.
                - If the input mentions 'digest', 'summary', or 'plan for today', the type is 'digest_request'. The content is the full input.
                - Otherwise, the type is 'unknown'. The content is the full input.`,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        content: { type: Type.STRING },
                    },
                },
            },
        });
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Error recognizing intent:", e);
        return { type: 'unknown', content: userInput };
    }
}

async function saveToMemory(text) {
    if (!memoryCollection) {
        console.error("Memory collection is not initialized. Cannot save note.");
        return;
    }
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await memoryCollection.add({
        ids: [docId],
        documents: [text],
        metadatas: [{ source: "whatsapp", timestamp: new Date().toISOString() }],
    });
    console.log(`Saved to memory (ID: ${docId}): "${text}"`);
}

async function answerQuestion(question) {
    if (!memoryCollection) {
        console.error("Memory collection is not initialized. Cannot answer question from memory.");
        return getGenericChatResponse(`Answer this question: ${question}`);
    }
    const results = await memoryCollection.query({
        nResults: 3,
        queryTexts: [question],
    });

    if (!results || !results.documents || !results.documents[0] || results.documents[0].length === 0) {
        console.log("No relevant memories found for the question.");
        return getGenericChatResponse(`Answer this question: ${question}`);
    }

    const context = results.documents[0].join('\n---\n');
    console.log(`Retrieved context for question: ${context}`);

    const prompt = `Based on the following context from my memory, please answer my question. If the context does not seem relevant to the question, answer the question based on your general knowledge but do not mention the context.

Context:
---
${context}
---

Question: ${question}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
}

async function getGenericChatResponse(userInput) {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userInput,
        config: {
            systemInstruction: "You are a friendly and helpful personal assistant. Keep your responses concise."
        }
    });
    return response.text;
}

async function sendDailyDigest(recipientId) {
    const mockTasks = [
        "- Calculus assignment due at 5 PM.",
        "- Call the library at noon.",
        "- Physics study group at 7 PM."
    ];

    const digestPrompt = `Create a friendly and motivating morning briefing for a college student. Include the following tasks: ${mockTasks.join(" ")}. Also, retrieve one interesting memory from the past that might be inspiring or relevant today.`;
    
    const answer = await answerQuestion("Pull an interesting memory from my notes.");

    const fullPrompt = `${digestPrompt}\n\nHere is a past memory to include: "${answer}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });

    const digestMessage = `*Good Morning! ☀️ Here is your daily digest:*\n\n${response.text}`;
    client.sendMessage(recipientId, digestMessage);
}


// --- STARTUP ---
client.initialize();

app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
});

process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await client.destroy();
    process.exit(0);
});
