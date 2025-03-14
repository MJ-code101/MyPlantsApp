// services/WeatherService.js
import axios from 'axios';

const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; 

export const fetchWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};