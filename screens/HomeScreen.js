import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { fetchWeatherData } from '../services/WeatherService';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase signOut
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plantHealth, setPlantHealth] = useState({
    totalPlants: 0,
    healthyPlants: 0,
    needsWater: 0,
  });

  // Fetch user location and weather data
  useEffect(() => {
    const getLocationAndWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to fetch weather data.');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

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
      const totalPlants = querySnapshot.size;
      const healthyPlants = querySnapshot.docs.filter((doc) => doc.data().healthStatus === 'healthy').length;
      const needsWater = querySnapshot.docs.filter((doc) => doc.data().needsWater).length;

      setPlantHealth({ totalPlants, healthyPlants, needsWater });
    });

    return () => unsubscribe();
  }, []);

  // Logout function
  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await signOut(auth); // Firebase sign out
              await AsyncStorage.removeItem('lastEmail'); // Remove saved email
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              Alert.alert("Success", "You have logged out successfully.");
            } catch (error) {
              console.error("Logout Error:", error);
              Alert.alert("Error", "Failed to log out.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Plant Care Companion</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Plants</Text>
        <Text>Total Plants: {plantHealth.totalPlants}</Text>
        <Text>Healthy Plants: {plantHealth.healthyPlants}</Text>
        <Text>Needs Water: {plantHealth.needsWater}</Text>
      </View>

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

      <View style={styles.buttonContainer}>
        <Button title="Go to Plant List" onPress={() => navigation.navigate('PlantList')} />
        <Button title="Monitor Environment" onPress={() => navigation.navigate('Sensor')} />
        <Button title="Add Plant" onPress={() => navigation.navigate('AddPlant')} />
        <Button title="Open Camera" onPress={() => navigation.navigate('Camera')} />
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20, padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  buttonContainer: { marginBottom: 12 },
  logoutContainer: { marginTop: 20, alignSelf: 'center' },
});

export default HomeScreen;