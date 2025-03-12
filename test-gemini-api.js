import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function testGeminiAPI() {
  console.log(`Testing Gemini API with key starting with: ${GEMINI_API_KEY.substring(0, 5)}...`);
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello, can you provide a simple exercise recommendation?"
          }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Response:", JSON.stringify(errorData, null, 2));
      return;
    }
    
    const data = await response.json();
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));
    
    if (data && data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      console.log("Response text:", data.candidates[0].content.parts[0].text);
    } else {
      console.log("Unexpected response structure:", data);
    }
  } catch (error) {
    console.error("Error testing Gemini API:", error);
  }
}

testGeminiAPI();
