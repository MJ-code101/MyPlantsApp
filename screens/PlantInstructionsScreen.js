import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { fetchWeatherData } from '../services/WeatherService';
import { getPlantCareInstructions } from '../services/GeminiService';
import * as Location from 'expo-location';

const PlantInstructionsScreen = ({ route }) => {
  const plant = route.params?.plant;

  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!plant || !plant.type) {
        Alert.alert('Missing Data', 'No plant type provided.');
        setLoading(false);
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location denied', 'Cannot generate instructions without weather data.');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const weather = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
        const temperature = weather.main.temp;

        const reply = await getPlantCareInstructions(plant.type, temperature);
        setInstructions(reply);
      } catch (err) {
        console.error('Instruction Error:', err);
        Alert.alert('Error', 'Failed to fetch plant instructions.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌿 Care Instructions</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Text style={styles.instructions}>{instructions}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default PlantInstructionsScreen;
