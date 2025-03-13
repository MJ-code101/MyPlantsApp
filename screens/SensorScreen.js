// screens/SensorScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const SensorScreen = () => {
  const [lightLevel, setLightLevel] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [lightData, setLightData] = useState([]);

  // Track whether an alert is currently being shown
  const isAlertActive = useRef(false);

  // Set thresholds for temperature alerts
  const tempThreshold = { min: 20, max: 25 }; 

  // Simulate sensor data and check thresholds
  useEffect(() => {
    const interval = setInterval(() => {
      // Skip checks if an alert is already active
      if (isAlertActive.current) return;

      // Generate random values for light, temperature, and humidity
      const newLightLevel = Math.random() * 1000; // Random light level between 0 and 1000 lux
      const newTemperature = Math.random() * 30 + 10; // Random temperature between 10°C and 40°C
      const newHumidity = Math.random() * 80 + 20; // Random humidity between 20% and 100%

      setLightLevel(newLightLevel);
      setTemperature(newTemperature);
      setHumidity(newHumidity);
      setLightData((prevData) => [...prevData.slice(-9), newLightLevel]);

      // Check temperature thresholds and show alerts
      if (newTemperature < tempThreshold.min) {
        showAlert('Low Temperature Alert', `Temperature is too low (${newTemperature.toFixed(2)}°C). Move your plant to a warmer location.`);
      } else if (newTemperature > tempThreshold.max) {
        showAlert('High Temperature Alert', `Temperature is too high (${newTemperature.toFixed(2)}°C). Move your plant to a cooler location.`);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  // Function 
  const showAlert = (title, message) => {
    // Set alert as active
    isAlertActive.current = true;

    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: () => {
          // Resume monitoring after the user presses "OK"
          isAlertActive.current = false;
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Environmental Monitoring</Text>

      <View style={styles.sensorContainer}>
        <Text style={styles.sensorText}>Light Level: {lightLevel.toFixed(2)} lux</Text>
        <Text style={styles.sensorText}>Temperature: {temperature.toFixed(2)}°C</Text>
        <Text style={styles.sensorText}>Humidity: {humidity.toFixed(2)}%</Text>
      </View>

      <Text style={styles.chartTitle}>Light Level Over Time</Text>
      <LineChart
        data={{
          labels: ['-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', 'Now'],
          datasets: [
            {
              data: lightData.length < 10 ? [...Array(10 - lightData.length).fill(0), ...lightData] : lightData,
            },
          ],
        }}
        width={350}
        height={200}
        yAxisSuffix=" lux"
        chartConfig={{
          backgroundColor: '#FFF',
          backgroundGradientFrom: '#FFF',
          backgroundGradientTo: '#FFF',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Green color
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sensorContainer: {
    marginBottom: 20,
  },
  sensorText: {
    fontSize: 18,
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
});

export default SensorScreen;
