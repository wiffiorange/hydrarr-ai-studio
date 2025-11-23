import { GoogleGenAI } from "@google/genai";
import { MediaItem } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getLibraryInsights = async (library: MediaItem[], query: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key not configured. Please check environment variables.";

  const libraryContext = library.map(item => `${item.title} (${item.year}) - ${item.type}`).join(', ');
  
  const prompt = `
    You are an intelligent media server assistant named "Medusa".
    
    Here is the user's current media library:
    [${libraryContext}]

    User Query: "${query}"

    Based on the library above, answer the user's query. 
    If they ask for recommendations, suggest things similar to what they have but not in the list.
    Keep the response concise and friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};