
import { Message } from '../types';

// The backend server URL. For development, it runs on port 3001.
// In a production environment, this would be your deployed server's URL.
const API_BASE_URL = 'http://localhost:3001';

export const getChatResponse = async (conversation: Message[]): Promise<string> => {
  const lastUserMessage = conversation[conversation.length - 1];
  if (!lastUserMessage || lastUserMessage.sender !== 'user') {
    // This case should ideally not be reached in normal operation
    return "An internal error occurred. No user message found.";
  }

  // The history should not include the latest message, which is the one we are sending
  const history = conversation.slice(0, -1);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // The backend expects the conversation history and the new message separately
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
