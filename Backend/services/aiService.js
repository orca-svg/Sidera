const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDEUlHvstqZpMfVS13qnckvoAkNlcisVPs');

// Use a model that supports instruction following well
const model = genAI.getGenerativeModel({
    model: "gemma-3-27b-it",
    // generationConfig: { responseMimeType: "application/json" } // Not supported by Gemma 3 yet
});

async function generateResponse(prompt) {
    try {
        const fullPrompt = `
      You are a helpful assistant. 
      Analyze the user's input and provide a helpful response.
      Also extract 1-3 short keywords (noun phrases) that represent the core topic.
      Rate the importance of this input/topic from 1 to 5 (1=Trivial, 3=Standard, 5=Crucial/Milestone).
      
      User Input: "${prompt}"
      
      Respond STRICTLY in this JSON format:
      {
        "answer": "Your detailed response here...",
        "keywords": ["keyword1", "keyword2"],
        "importance": 3
      }
    `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        console.log(`[AI Raw Text]`, text);

        // Safety parse
        try {
            // Remove markdown code blocks if present
            const jsonText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '');
            return JSON.parse(jsonText);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return {
                answer: text, // Fallback
                keywords: ["Thought"],
                importance: 2
            };
        }
    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            answer: "I am unable to contemplate that at the moment.",
            keywords: ["Error"],
            importance: 1
        };
    }
}

module.exports = { generateResponse };
