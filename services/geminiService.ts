import { GoogleGenAI, Type } from "@google/genai";
import { SpaceAnalysis } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the uploaded image to determine style, pros, cons, furniture, lighting and suggestions.
 */
export const analyzeSpaceImage = async (base64Image: string): Promise<SpaceAnalysis> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `Analiza esta imagen de un espacio interior.
  1. Identifica el estilo de decoración actual.
  2. Lista los muebles principales detectados en la imagen (ej: sofá en L, mesa de centro de vidrio, lámpara de pie).
  3. Lista 3 ventajas (pros) del espacio.
  4. Lista 3 desventajas (cons) o áreas de mejora.
  5. Sugiere exactamente 7 estilos de decoración diferentes que quedarían bien.
  
  Para cada estilo sugerido:
  - Nombre del estilo.
  - Breve descripción de por qué funciona.
  - Paleta de 3 colores.
  - Sugerencia de ILUMINACIÓN específica: cambios en intensidad/color o nuevas luminarias (lámparas, apliques) para realzar este estilo.
  - Sugerencia de MOBILIARIO: qué muebles existentes mantener, cuáles reemplazar y cómo integrarlos.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentStyle: { type: Type.STRING },
            detectedFurniture: { type: Type.ARRAY, items: { type: Type.STRING } },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lightingTips: { type: Type.STRING },
                  furnitureAdvice: { type: Type.STRING },
                },
                required: ["name", "description", "colorPalette", "lightingTips", "furnitureAdvice"],
              },
            },
          },
          required: ["currentStyle", "detectedFurniture", "pros", "cons", "suggestions"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SpaceAnalysis;
    }
    throw new Error("No se pudo analizar la imagen.");
  } catch (error) {
    console.error("Error analyzing space:", error);
    throw error;
  }
};

/**
 * Generates a redesigned version of the space using the original image as a structural reference.
 */
export const generateRedesign = async (
  base64Image: string,
  styleName: string,
  styleDescription: string,
  lightingTips: string,
  furnitureAdvice: string
): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  // Prompt engineered to maintain structure while changing style (editing/inpainting logic via generation)
  const prompt = `Una fotografía fotorrealista de alta calidad de este mismo espacio interior renovado al estilo ${styleName}.
  Mantén estrictamente la estructura arquitectónica original (paredes, ventanas, suelo, techo).
  
  Instrucciones de Mobiliario: ${furnitureAdvice}
  Instrucciones de Iluminación: ${lightingTips}
  
  La imagen debe ser un "Después" impresionante de una renovación de diseño de interiores.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        // gemini-2.5-flash-image handles image output in parts
      }
    });

    // Extract the image from the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No se generó ninguna imagen.");
  } catch (error) {
    console.error("Error generating redesign:", error);
    throw error;
  }
};
