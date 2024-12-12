import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Validate API key format
const isValidApiKey = (key: string) => {
  return /^AIza[0-9A-Za-z-_]{35}$/.test(key);
};

if (!apiKey || !isValidApiKey(apiKey)) {
  console.error('Invalid or missing Gemini API key. Please check your .env file.');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the model with proper error handling
export const getModel = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    // Test the model with a simple prompt
    await model.generateContent('test');
    return model;
  } catch (error) {
    console.error('Failed to initialize Gemini model:', error);
    return null;
  }
};

// Helper function for generating AI responses
export const generateAIResponse = async (prompt: string) => {
  try {
    const model = await getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    // Add instruction for concise response
    const enhancedPrompt = `Please provide a brief response in 3-4 lines maximum: ${prompt}`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from AI');
    }
    
    // Ensure response is concise by truncating if necessary
    const lines = text.split('\n').filter(line => line.trim());
    const conciseResponse = lines.slice(0, 4).join('\n');
    
    return conciseResponse;
  } catch (error) {
    throw new Error(`AI Response Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};