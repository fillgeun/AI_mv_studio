import { GoogleGenAI } from "@google/genai";

// Do not initialize here to prevent app crash if API_KEY is not set.
let ai: GoogleGenAI | null = null;

function getAiInstance() {
    if (ai) return ai;
    const apiKey = process.env.API_KEY;
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        return ai;
    }
    return null;
}

export async function runGemini(prompt: string): Promise<string> {
    const aiInstance = getAiInstance();
    if (!aiInstance) {
      return "An error occurred: API_KEY environment variable not set. Please configure the API key to use this feature.";
    }

    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;

        if (!text) {
          return "Sorry, I couldn't generate a response. Please try again.";
        }
        
        return text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `An error occurred: ${error.message}. Please check your API key and network connection.`;
        }
        return "An unknown error occurred while contacting the Gemini API.";
    }
}

export async function startVideoGeneration(prompt: string): Promise<any> {
    const aiInstance = getAiInstance();
    if (!aiInstance) {
        throw new Error("API_KEY environment variable not set.");
    }
    try {
        const operation = await aiInstance.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        throw error;
    }
}

export async function checkVideoGenerationStatus(operation: any): Promise<any> {
    const aiInstance = getAiInstance();
     if (!aiInstance) {
        throw new Error("API_KEY environment variable not set.");
    }
    try {
        const updatedOperation = await aiInstance.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error checking video generation status:", error);
        throw error;
    }
}