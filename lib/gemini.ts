
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAIGradingSuggestion(questionText: string, studentAnswer: string, maxWeight: number) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      You are an expert academic assessor. Grade the following essay response.
      
      Question: "${questionText}"
      Max Points: ${maxWeight}
      Student Answer: "${studentAnswer}"
      
      Provide your grading in JSON format with "score" (number) and "feedback" (string, max 3 sentences).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Recommended score out of max points." },
          feedback: { type: Type.STRING, description: "Constructive feedback for the student." }
        },
        required: ["score", "feedback"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
}
