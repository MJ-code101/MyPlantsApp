import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchWeatherData } from '../services/WeatherService'; // Import Weather API function
import * as Location from 'expo-location';

const SensorScreen = () => {
  const [lightLevel, setLightLevel] = useState(0);
  const [temperature, setTemperature] = useState(null); // Use real temperature
  const [humidity, setHumidity] = useState(null);
  const [lightData, setLightData] = useState([]);
  const [loading, setLoading] = useState(true); // Show loading until data is fetched
  const isAlertActive = useRef(false);
  const tempThreshold = { min: 0, max: 30 };

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to fetch weather data.');
          setLoading(false);
          return;
        }

        // Get the user's location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch weather data using API
        const weatherData = await fetchWeatherData(latitude, longitude);
        const newTemperature = weatherData?.main?.temp ?? null; // Ensure it's not undefined
        const newHumidity = weatherData?.main?.humidity ?? null;

        setTemperature(newTemperature);
        setHumidity(newHumidity);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        Alert.alert('Error', 'Failed to fetch weather data.');
        setLoading(false);
      }
    };

    getWeatherData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAlertActive.current || temperature === null) return;

      const newLightLevel = Math.random() * 1000;
      setLightLevel(newLightLevel);
      setLightData((prevData) => [...prevData.slice(-9), newLightLevel]);

      if (temperature < tempThreshold.min) {
        showAlert('Low Temperature Alert', `Temperature is too low (${temperature.toFixed(2)}°C).`);
      } else if (temperature > tempThreshold.max) {
        showAlert('High Temperature Alert', `Temperature is too high (${temperature.toFixed(2)}°C).`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [temperature]);

  const showAlert = (title, message) => {
    isAlertActive.current = true;
    Alert.alert(title, message, [{ text: 'OK', onPress: () => (isAlertActive.current = false) }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Environmental Monitoring</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <View style={styles.sensorContainer}>
          <Text style={styles.sensorText}>Light Level: {lightLevel.toFixed(2)} lux</Text>
          <Text style={styles.sensorText}>Temperature: {temperature !== null ? `${temperature.toFixed(2)}°C` : 'Loading...'}</Text>
          <Text style={styles.sensorText}>Humidity: {humidity !== null ? `${humidity}%` : 'Loading...'}</Text>
        </View>
      )}

      <Text style={styles.chartTitle}>Temperature Over Time</Text>
      <LineChart
        data={{
          labels: ['-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', 'Now'],
          datasets: [{ data: Array(10).fill(temperature ?? 0) }],
        }}
        width={350}
        height={200}
        yAxisSuffix="°C"
        chartConfig={{
          backgroundColor: '#FFF',
          backgroundGradientFrom: '#FFF',
          backgroundGradientTo: '#FFF',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sensorContainer: { marginBottom: 20 },
  sensorText: { fontSize: 18, marginBottom: 10 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  chart: { borderRadius: 16 },
});

export default SensorScreen;
