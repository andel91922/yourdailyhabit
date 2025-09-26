
import { GoogleGenAI } from "@google/genai";

export const generateWeeklyInsight = async (summaryData: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "API key not configured. Please set up your environment variables.";
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Based on the following weekly habit tracking data, provide a concise and encouraging 2-3 sentence summary in Traditional Chinese. 
      Highlight a key achievement (like a long streak or high completion rate), gently point out a habit that needs more attention, and offer a simple, actionable tip for the upcoming week.
      The tone should be supportive, not critical.

      Data:
      ${summaryData}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error generating weekly insight:", error);
    return "抱歉，無法生成您的每週洞察。請稍後再試。";
  }
};
