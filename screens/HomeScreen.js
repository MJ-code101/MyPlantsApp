// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchWeatherData } from '../services/WeatherService'; // Import weather service

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null); // State for weather data
  const [loading, setLoading] = useState(true); // Loading state for weather fetch
  const [plantHealth, setPlantHealth] = useState({
    totalPlants: 0,
    healthyPlants: 0,
    needsWater: 0,
  }); // State for plant health data

  // Simulate fetching plant health data (replace with actual Firestore data later)
  useEffect(() => {
    // Mock plant health data
    setPlantHealth({
      totalPlants: 5,
      healthyPlants: 3,
      needsWater: 2,
    });
  }, []);

  // Fetch weather data on component mount
  useEffect(() => {
    const getWeather = async () => {
      try {
        const data = await fetchWeatherData(37.7749, -122.4194); // Example coordinates (San Francisco)
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Plant Care Companion</Text>

      {/* Plant Health Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Plants</Text>
        <Text>Total Plants: {plantHealth.totalPlants}</Text>
        <Text>Healthy Plants: {plantHealth.healthyPlants}</Text>
        <Text>Needs Water: {plantHealth.needsWater}</Text>
      </View>

      {/* Weather Updates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : weather ? (
          <>
            <Text>Temperature: {weather.main.temp}°C</Text>
            <Text>Humidity: {weather.main.humidity}%</Text>
            <Text>Weather: {weather.weather[0].description}</Text>
          </>
        ) : (
          <Text>Unable to fetch weather data</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Plant List"
          onPress={() => navigation.navigate('PlantList')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Monitor Environment"
          onPress={() => navigation.navigate('Sensor')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    marginBottom: 12,
  },
});

export default HomeScreen;