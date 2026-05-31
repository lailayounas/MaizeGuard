import { GoogleGenAI } from '@google/genai';

// Fallback to import.meta.env for github repo deployed outside AI studio
const getApiKey = () => {
  try {
    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  } catch(e) {}
  return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
};

export const getAI = () => {
  const key = getApiKey();
  if (!key) {
    throw new Error("API key is missing. Please set GEMINI_API_KEY or use the Change API Key button.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export async function analyzeMaizeLeaf(base64Image: string, mimeType: string) {
  const ai = getAI();
  const prompt = `You are an expert AI agriculture assistant diagnosing maize (corn) leaf diseases.
You need to analyze the provided image and classify it into exactly ONE of the following 4 classes:
- Blight (Northern Corn Leaf Blight)
- Common Rust
- Grey Leaf Spot
- Healthy

Return your response in pure JSON format (without markdown blocks or additional text) with the following structure:
{
  "prediction": "Blight" | "Common Rust" | "Grey Leaf Spot" | "Healthy",
  "confidence": number (between 0.0 and 1.0),
  "details": "string (Why did you make this prediction? What are the visual symptoms observed?)",
  "treatment": "string (Suggested treatments or actions)",
  "prevention": "string (How to prevent this in the future, or how to maintain health if healthy)"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType,
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse json
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    let errorMsg = error?.message;
    if (!errorMsg) {
       errorMsg = typeof error === 'string' ? error : JSON.stringify(error);
    }
    throw new Error(errorMsg || "Failed to analyze image.");
  }
}
