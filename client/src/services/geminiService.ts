import { Message } from '../types';

// Use a relative path for API calls.
// In development, Vite's proxy will redirect this to http://localhost:3001/api/chat.
// In production, the server will handle this request directly.
const API_BASE_URL = '/api';

export const getChatResponse = async (conversation: Message[]): Promise<string> => {
  const lastUserMessage = conversation[conversation.length - 1];
  if (!lastUserMessage || lastUserMessage.sender !== 'user') {
    return "An internal error occurred. No user message found.";
  }

  const history = conversation.slice(0, -1);

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: history,
        message: lastUserMessage.text,
      }),
    });
  
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "Sorry, I received an empty response.";

  } catch (error) {
    console.error("Error fetching chat response:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

// Mock function to summarize a URL or document
export const getSummary = async (source: string, type: 'URL' | 'PDF'): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `This is a summary for the ${type}: ${source}. It covers key concepts including A, B, and C, making it easier for you to review for your upcoming exams.`;
};
