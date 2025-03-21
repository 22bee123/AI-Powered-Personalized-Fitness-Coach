import CoachAIChat from '../model/coachAI.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate system prompt for the AI Coach
const generateSystemPrompt = () => {
  return `You are an expert AI fitness coach. Your role is to provide personalized fitness guidance, 
  workout advice, and nutrition recommendations to help users achieve their fitness goals.
  
  When responding to users:
  - Be encouraging, supportive, and motivational
  - Provide specific, actionable advice tailored to the user's needs
  - Use clear, concise language with proper formatting (bullet points, numbered lists)
  - Include scientific explanations when relevant, but keep them accessible
  - Respect limitations and suggest modifications for different fitness levels
  - Emphasize safety and proper form for all exercise recommendations
  
  Format your responses with clear section headers, bullet points for lists, numbered steps for instructions,
  and bold text for important points. Include examples where helpful.
  
  Remember to be conversational and engaging while maintaining your expertise as a fitness professional.`;
};

// Chat with AI Coach endpoint
export const chatWithAICoach = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `${generateSystemPrompt()}\n\nUser message: ${message}`;
    
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Save the chat history to the database
      const chatEntry = new CoachAIChat({
        userId,
        userMessage: message,
        aiResponse: responseText
      });

      await chatEntry.save();

      res.status(200).json({
        message: 'AI Coach response generated successfully',
        response: responseText
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      return res.status(500).json({ 
        message: 'Failed to generate AI response. Please try again.',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in chatWithAICoach:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
};

// Get chat history for a user
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chatHistory = await CoachAIChat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to the most recent 50 messages
    
    res.status(200).json({ chatHistory });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
};

// Clear chat history for a user
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await CoachAIChat.deleteMany({ userId });
    
    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
};