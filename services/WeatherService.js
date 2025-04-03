// services/WeatherService.js
import axios from 'axios';

const API_KEY = '245340e6525d0a19b36ab6506232bd8e'; 

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