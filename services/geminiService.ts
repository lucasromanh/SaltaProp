
import { GoogleGenAI, Type } from "@google/genai";

// Safe initialization of Gemini AI
const getAiInstance = () => {
  try {
    const key = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.API_KEY) ||
      '';

    if (!key || key === 'undefined') {
      console.warn("Gemini API key not found. AI features will be disabled.");
      return null;
    }

    return new GoogleGenAI({ apiKey: key });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  }
};

const ai = getAiInstance();

export const getPropertyAdvice = async (userPrompt: string, propertyContext?: string) => {
  try {
    if (!ai) {
      return "La función de consulta IA no está disponible. Por favor contacta a un agente humano para más información.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Eres un asistente experto de "Salta Propiedades Premium". 
      Ayuda al usuario con su consulta sobre inmuebles en Salta Capital, Argentina.
      ${propertyContext ? `Contexto de la propiedad actual: ${propertyContext}` : ''}
      Usuario dice: ${userPrompt}`,
      config: {
        systemInstruction: "Se profesional, amable y conocedor de la geografía de Salta (clima, barrios, inversiones). Responde en español de Argentina.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, no pude procesar tu consulta en este momento. Por favor contacta a un agente humano.";
  }
};

export const generatePropertySummary = async (property: any) => {
  try {
    if (!ai) {
      return { summary: property.description, highlights: property.amenities };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Genera un resumen persuasivo y elegante de 2 párrafos para esta propiedad en Salta:
      Título: ${property.title}
      Barrio: ${property.neighborhood}
      Características: ${property.bedrooms} dormitorios, ${property.area}m2, ${property.amenities.join(', ')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "highlights"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return { summary: property.description, highlights: property.amenities };
  }
};
