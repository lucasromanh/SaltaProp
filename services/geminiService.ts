
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPropertyAdvice = async (userPrompt: string, propertyContext?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    return { summary: property.description, highlights: property.amenities };
  }
};
