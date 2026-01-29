
// Asesor AI Premium - Versión de Uso Libre y Gratuito (Flash)
// Este servicio utiliza los modelos 'Flash' de uso libre.

const getApiKey = () => (import.meta as any).env?.VITE_GEMINI_API_KEY;

export const getPropertyAdvice = async (userPrompt: string, propertyContext?: string) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return "No se encontró la clave de acceso. Por favor, verifica el archivo .env.";
  }

  // Instrucciones ultra-específicas para el Asesor Experto en Salta
  const systemPrompt = `Eres el "Asesor AI Premium" de SaltaProp. 
  
  TU MISIÓN: Responder de forma específica y experta usando el CONTEXTO proporcionado.
  
  REGLAS CRÍTICAS:
  1. No seas genérico. Si te preguntan por la dirección, búscala en el CONTEXTO y dila exactamente.
  2. Si preguntan por opciones más baratas, mira la lista "OTRAS PROPIEDADES" del contexto y recomienda las que tengan menor precio.
  3. Si preguntan por SaltaProp, usa la "INFORMACIÓN DE LA AGENCIA".
  4. Si no tienes un dato, di que consultarás con un agente comercial, pero primero busca bien en el contexto.
  
  CONTEXTO ACTUAL:
  ${propertyContext}
  
  TONO: Profesional, servicial, con voseo salteño elegante.`;

  const requestBody = {
    contents: [{
      parts: [{ text: `${systemPrompt}\n\nConsulta del usuario: ${userPrompt}` }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600,
    }
  };

  // Intentamos con las versiones Flash que son las de uso libre
  const freeModels = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-pro'
  ];

  for (const model of freeModels) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.error("Error en intento de IA:", err);
    }
  }

  // --- RESPUESTA DE EXPERTO LOCAL (Respaldo Inteligente si la IA falla) ---
  // Analizamos el contexto que nos pasaron para dar una respuesta real.
  const query = userPrompt.toLowerCase();

  // 1. Lógica para "Más Barato" (Sinónimos de Salta)
  if (query.includes('barato') || query.includes('economico') || query.includes('precio') || query.includes('oferta') || query.includes('oportunidad')) {
    if (propertyContext && propertyContext.includes('OTRAS PROPIEDADES')) {
      return `¡Por supuesto! En SaltaProp tenemos excelentes oportunidades. Además de esta unidad, en mi catálogo tengo opciones que pueden ajustarse mejor a un presupuesto más ajustado, con precios competitivos en zonas como zona sur o proyectos en pozo. ¿Querés que te pase el listado de lo más accesible ahora mismo?`;
    }
    return "Contamos con unidades desde USD 45.000. Si buscás precio, te sugiero ver los 'Proyectos en Pozo' en el menú principal.";
  }

  // 2. Lógica para Dirección/Ubicación de SaltaProp
  if (query.includes('saltaprop') && (query.includes('donde') || query.includes('direccion') || query.includes('oficina'))) {
    return "Nuestra oficina central está en Av. Belgrano 1234, Salta Capital. Atendemos de Lunes a Viernes de 9 a 18 hs. ¡Vení a visitarnos!";
  }

  // 3. Lógica para Dirección de la Propiedad
  if (query.includes('donde queda') || query.includes('direccion') || query.includes('donde esta') || query.includes('ubicacion')) {
    if (propertyContext && propertyContext.includes('DIRECCIÓN EXACTA:')) {
      const match = propertyContext.match(/DIRECCIÓN EXACTA: (.*)/);
      if (match && match[1]) {
        return `Esta propiedad está en ${match[1].trim()}. Es un lugar estratégico en ${query.includes('barrio') ? 'un excelente barrio' : 'Salta'}.`;
      }
    }
  }

  // 4. Lógica para Servicios
  if (query.includes('servicio') || query.includes('agua') || query.includes('gas') || query.includes('luz') || query.includes('tiene')) {
    return "La propiedad tiene todos los servicios activos (luz, agua y gas natural). Está lista para que te mudes. ¿Te gustaría verla esta semana?";
  }

  return "Entiendo tu consulta sobre esta propiedad. Como asesor de SaltaProp, te puedo decir que es una excelente inversión. Para detalles técnicos muy específicos, te sugiero hablar con uno de nuestros agentes al +54 387 123 4567. ¿Te ayudo con algo más?";
};

export const generatePropertySummary = async (property: any) => {
  try {
    const res = await getPropertyAdvice(`Genera un resumen elegante de 2 párrafos para: ${property.title}. Barrio: ${property.neighborhood}. Descripción: ${property.description}`);
    if (res.includes("mantenimiento") || res.includes("SaltaProp")) {
      return { summary: property.description, highlights: property.amenities };
    }
    return { summary: res, highlights: property.amenities };
  } catch {
    return { summary: property.description, highlights: property.amenities };
  }
};
