import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAgriculturalAdvice(query: string, context?: string, language: string = "English") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert agricultural AI assistant specializing in East African farming (Kenya, Tanzania, Uganda, Rwanda, Ethiopia). 
      Context: ${context || "General agricultural advice"}
      User Query: ${query}
      Language: ${language}
      
      Provide localized, practical, and actionable advice for a smallholder farmer. 
      Respond in ${language}. If the query is about a specific crop or pest, provide detailed steps for resolution. 
      Focus on low-cost, organic, and climate-smart solutions.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
  }
}

export async function getPlantingSchedule(crop: string, location: string, language: string = "English") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a climate-smart planting schedule for ${crop} in ${location}.
      Language: ${language}
      
      Include:
      1. Best planting month based on current climate trends.
      2. Soil preparation steps.
      3. Irrigation and fertilization schedule (low-cost).
      4. Harvest timeline.
      
      Respond in ${language}.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Schedule):", error);
    return "Could not generate schedule.";
  }
}

export async function analyzeCropIssue(imageUrl: string, description: string, language: string = "English") {
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
          text: `Analyze this crop issue for a smallholder farmer in East Africa. 
          Description: ${description}. 
          Language: ${language}
          
          Identify the potential pest or disease and suggest immediate, low-cost treatments or preventive measures.
          Respond in ${language}.`,
        },
      ],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Vision):", error);
    return "I'm sorry, I couldn't analyze the image. Please provide more details in text.";
  }
}
