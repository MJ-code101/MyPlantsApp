// services/GeminiService.js
import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyDF7g92xwafnQJcadCWrwiy9vENcRy12XA'; 

export const getPlantCareInstructions = async (plantType, temperature) => {
  try {
    if (!plantType || !temperature) {
      throw new Error('Missing plant type or temperature');
    }

    const prompt = `You are a smart plant care assistant.

Give specific care instructions for a "${plantType}" plant based on this current weather:

- Temperature: ${temperature}°C

- Humidity: (assume average if not given)

- Condition: (assume partly cloudy if not given)

Your response must be friendly, clear, and useful to beginner plant owners. Use bullet points.

Include the following in **this exact structure**:

- 🌱 Watering frequency: Every X days  

- ⏰ Best time of day to water: e.g., 8:00 AM  

- ☀️ Sunlight needs: e.g., bright indirect light  

- 💧 Humidity tips: e.g., misting, humidifier, or leave near kitchen  

- 🌿 Fertilizing advice:
    - When to fertilize (e.g., monthly in spring)
    - Type of fertilizer (e.g., NPK 10-10-10)

- ⚠️ Special advice based on current temperature (${temperature}°C): any warnings or seasonal notes

IMPORTANT: Write the "Watering frequency" and "Best time of day to water" in **EXACT** formats so the app can extract and use them.`;

   

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: GEMINI_API_KEY,
        },
      }
    );

    const message =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No care instructions returned.';

    return message;
  } catch (error) {
    console.error('Gemini API Error:', error?.response?.data || error.message);
    return '❌ Failed to get care instructions. Please try again later.';
  }
};
