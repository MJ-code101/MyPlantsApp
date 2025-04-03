// services/GeminiService.js
import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyDF7g92xwafnQJcadCWrwiy9vENcRy12XA'; 

export const getPlantCareInstructions = async (plantType, temperature) => {
  try {
    if (!plantType || !temperature) {
      throw new Error('Missing plant type or temperature');
    }

    const prompt = `Give simple plant care instructions for a ${plantType} plant in ${temperature}°C weather. Include advice on watering, sunlight, and humidity.`;

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
