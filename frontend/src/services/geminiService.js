const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const getGeminiResponse = async (prompt, responseSchema) => {
  if (!API_KEY) {
      const errorMessage = "API key is missing. Please make sure REACT_APP_GEMINI_API_KEY is set in your .env file and you have restarted the server.";
      console.error(errorMessage);
      return { error: errorMessage };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: responseSchema,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", errorBody);
      throw new Error(`Google AI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error fetching from Google AI:', error);
    return { error: 'Failed to retrieve information from AI assistant. Please try again.' };
  }
};

export const getHomeRemedies = (condition) => {
  const prompt = `Based on the skin condition "${condition}", find up to 10 popular and generally safe home remedies. For each remedy, provide its name, a Google search link for more details, and a brief, practical direction on how to apply or use it on the affected skin area.`;
  const schema = {
    type: "OBJECT",
    properties: {
      remedies: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            link: { type: "STRING" },
            directions: { type: "STRING" },
          },
          required: ["name", "link", "directions"],
        },
      },
    },
  };
  return getGeminiResponse(prompt, schema);
};

export const getSkincareProducts = (condition) => {
  const prompt = `Based on the skin condition "${condition}", find up to 10 commercially available over-the-counter skincare products or product types that are commonly recommended. For each, provide the product name/type and a Google Shopping search link.`;
  const schema = {
    type: "OBJECT",
    properties: {
      products: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            link: { type: "STRING" },
          },
          required: ["name", "link"],
        },
      },
    },
  };
  return getGeminiResponse(prompt, schema);
};

export const getDermatologists = (condition) => {
  const prompt = `Find up to 10 dermatologists or specialized clinics in Nigeria known for treating "${condition}". For each, provide their name, city/address, a link to their official website or contact page, and their LinkedIn profile URL if available.`;
  const schema = {
    type: "OBJECT",
    properties: {
      dermatologists: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            location: { type: "STRING" },
            link: { type: "STRING" },
            linkedin: { type: "STRING" },
          },
          required: ["name", "location", "link"],
        },
      },
    },
  };
  return getGeminiResponse(prompt, schema);
};

export const getChatbotResponse = async (history, message) => {
    const prompt = `You are the DermaScan AI, an empathetic and knowledgeable AI assistant. A user is asking for more information about their diagnosed skin condition. Keep your answers helpful, safe, and clear. Always remind the user that you are an AI and cannot provide official medical advice. Conversation History:\n${history.map(msg => `${msg.role}: ${msg.text}`).join('\n')}\n\nNew User Question: ${message}\n\nYour Response:`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Chatbot API Error:', error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
};
