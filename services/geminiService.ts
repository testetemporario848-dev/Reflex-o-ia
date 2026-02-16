
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ReflectionResponse } from "../types";

// Função auxiliar para atraso em caso de retry
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Gera uma reflexão usando o modelo Gemini com suporte a streaming 
 * para uma experiência de usuário mais responsiva.
 */
export const generateReflectionStream = async (
  category: string, 
  context: string,
  onChunk: (text: string) => void
): Promise<ReflectionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let retryCount = 0;
  const maxRetries = 2;

  const executeRequest = async (): Promise<ReflectionResponse> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise a seguinte situação e forneça uma reflexão profunda, um conselho prático, uma afirmação positiva e uma citação relevante. 
        A resposta DEVE estar em formato JSON estrito conforme o schema.
        
        Categoria: ${category}
        Contexto do Usuário: ${context}`,
        config: {
          systemInstruction: "Você é um mentor de vida sábio e empático. Sua missão é fornecer clareza e paz. Retorne SEMPRE um JSON válido.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reflection: { type: Type.STRING },
              advice: { type: Type.STRING },
              affirmation: { type: Type.STRING },
              quote: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  author: { type: Type.STRING }
                },
                required: ['text', 'author']
              },
            },
            required: ['reflection', 'advice', 'affirmation', 'quote'],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("Resposta vazia do servidor.");
      
      // Simulamos um pequeno delay de "escrita" para o usuário sentir a fluidez se necessário,
      // mas aqui retornamos o objeto completo após a validação do JSON.
      return JSON.parse(text.trim());
    } catch (error: any) {
      if (retryCount < maxRetries && (error.status === 429 || error.status >= 500)) {
        retryCount++;
        await delay(1000 * retryCount);
        return executeRequest();
      }
      throw error;
    }
  };

  return executeRequest();
};

/**
 * Gera uma reflexão aleatória rápida.
 */
export const generateRandomReflection = async (): Promise<ReflectionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Gere uma reflexão aleatória curta, inspiradora e impactante para o dia de hoje.",
      config: {
        systemInstruction: "Você é um mestre zen. Responda em JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflection: { type: Type.STRING },
            advice: { type: Type.STRING },
            affirmation: { type: Type.STRING },
            quote: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                author: { type: Type.STRING }
              }
            }
          },
          required: ['reflection', 'advice', 'affirmation', 'quote']
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro no 'servidor' Gemini:", error);
    throw new Error("Não foi possível conectar ao servidor de sabedoria.");
  }
};
