import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAgriculturalAdvice(query: string, context?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert agricultural AI assistant. 
      Context: ${context || "General agricultural advice"}
      User Query: ${query}
      
      Provide localized, practical, and actionable advice for a farmer. If the query is about a specific crop or pest, provide detailed steps for resolution.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
  }
}

export async function analyzeCropIssue(imageUrl: string, description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageUrl.split(',')[1], // Assume base64
          },
        },
        {
          text: `Analyze this crop issue. Description: ${description}. 
          Identify the potential pest or disease and suggest immediate treatments or preventive measures for the farmer.`,
        },
      ],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Vision):", error);
    return "I'm sorry, I couldn't analyze the image. Please provide more details in text.";
  }
}
