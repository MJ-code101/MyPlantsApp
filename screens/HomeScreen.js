// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location'; // Import expo-location
import { fetchWeatherData } from '../services/WeatherService'; // Import weather service
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';

const db = getFirestore();

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null); // State for weather data
  const [loading, setLoading] = useState(true); // Loading state for weather fetch
  const [plantHealth, setPlantHealth] = useState({
    totalPlants: 0,
    healthyPlants: 0,
    needsWater: 0,
  }); // State for plant health data

  // Fetch user location and weather data
  useEffect(() => {
    const getLocationAndWeather = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to fetch weather data.');
          setLoading(false);
          return;
        }

        // Get the current position
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch weather data using the coordinates
        const weatherData = await fetchWeatherData(latitude, longitude);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error fetching location or weather data:', error);
        Alert.alert('Error', 'Unable to fetch location or weather data.');
      } finally {
        setLoading(false);
      }
    };

    getLocationAndWeather();
  }, []);

  // Fetch plant data and calculate health metrics
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/plants`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const totalPlants = querySnapshot.size; // Total number of plants
      const healthyPlants = querySnapshot.docs.filter((doc) => doc.data().healthStatus === 'healthy').length;
      const needsWater = querySnapshot.docs.filter((doc) => doc.data().needsWater).length;

      setPlantHealth({
        totalPlants,
        healthyPlants,
        needsWater,
      });
    });

    return () => unsubscribe(); // Cleanup listener
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
      <View style={styles.buttonContainer}>
        <Button
          title="Add Plant"
          onPress={() => navigation.navigate('AddPlant')}
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