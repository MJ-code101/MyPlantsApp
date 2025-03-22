import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeatherData } from '../services/WeatherService';
import { getAuth, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const HomeScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [careTip, setCareTip] = useState('');
  const [plantHealth, setPlantHealth] = useState({
    totalPlants: 0,
    healthyPlants: 0,
    needsWater: 0,
  });

  // Fetch weather based on GPS
  useEffect(() => {
    const getLocationAndWeather = async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to fetch weather data.'
          );
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const weatherData = await fetchWeatherData(latitude, longitude);
        setWeather(weatherData);
        generateCareTip(weatherData);
      } catch (error) {
        console.error('Error fetching location or weather:', error);
        Alert.alert('Error', 'Unable to fetch location or weather data.');
      } finally {
        setLoading(false);
      }
    };

    getLocationAndWeather();
  }, []);

  // Weather-based tip logic
  const generateCareTip = (weatherData) => {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const description = weatherData.weather[0].description.toLowerCase();

    if (temp > 28) {
      setCareTip('🔥 It’s hot today — water early and avoid direct sun.');
    } else if (temp < 15) {
      setCareTip('❄️ It’s cold — keep tropical plants away from windows.');
    } else if (humidity < 40) {
      setCareTip('💧 Low humidity — consider misting your plants.');
    } else if (description.includes('rain')) {
      setCareTip('🌧️ It’s rainy! You can skip watering today.');
    } else {
      setCareTip('✅ Conditions look great! Your plants should thrive today.');
    }
  };

  // Fetch plant data from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, `users/${user.uid}/plants`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const totalPlants = querySnapshot.size;
      const healthyPlants = querySnapshot.docs.filter(
        (doc) => doc.data().healthStatus === 'healthy'
      ).length;
      const needsWater = querySnapshot.docs.filter(
        (doc) => doc.data().needsWater
      ).length;

      setPlantHealth({ totalPlants, healthyPlants, needsWater });
    });

    return () => unsubscribe();
  }, []);

  // Logout
  const handleLogout = () => {
    Alert.alert('Logout Confirmation', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await signOut(auth);
            await AsyncStorage.removeItem('lastEmail');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            Alert.alert('Success', 'You have logged out successfully.');
          } catch (error) {
            console.error('Logout Error:', error);
            Alert.alert('Error', 'Failed to log out.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌱 Plant Care Companion</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🪴 Your Plant Overview</Text>
        <Text style={styles.text}>Total Plants: {plantHealth.totalPlants}</Text>
        <Text style={styles.text}>Healthy Plants: {plantHealth.healthyPlants}</Text>
        <Text style={styles.text}>Needs Water: {plantHealth.needsWater}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌤️ Current Weather</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : weather ? (
          <>
            <Text style={styles.text}>
              Temperature: {weather.main.temp}°C
            </Text>
            <Text style={styles.text}>
              Humidity: {weather.main.humidity}%
            </Text>
            <Text style={styles.text}>
              Condition: {weather.weather[0].description}
            </Text>
          </>
        ) : (
          <Text style={styles.text}>Unable to load weather data</Text>
        )}
      </View>

      {careTip && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>🌿 Smart Tip:</Text>
          <Text style={styles.tipText}>{careTip}</Text>
        </View>
      )}

      <View style={styles.logoutContainer}>
        <Text style={styles.logoutText} onPress={handleLogout}>
          🚪 Logout
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f9f7',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
  },
  tipContainer: {
    backgroundColor: '#e9f7ef',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  logoutText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;
