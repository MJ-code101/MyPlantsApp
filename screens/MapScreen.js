import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const MapScreen = () => {
  const [region, setRegion] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});  //Current Location
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      fetchStores(latitude, longitude);
    })();
  }, []);

  const fetchStores = async (lat, lon) => {  //Get nearby plant stores
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: 'plant store',
          format: 'json',
          limit: 10,
          lat,
          lon,
        },
      });
      setStores(res.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      Alert.alert('Error', 'Failed to fetch nearby stores.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading map and stores...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      provider={null} // Optional for OpenStreetMap
    >
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        title="You are here"
        pinColor="blue"
      />

      {stores.map((store, index) => {
        const lat = parseFloat(store?.lat);
        const lon = parseFloat(store?.lon);

        if (
          isNaN(lat) ||
          isNaN(lon) ||
          typeof lat !== 'number' ||
          typeof lon !== 'number'
        ) {
          return null; // Skip bad marker data
        }

        return (
          <Marker
            key={index}
            coordinate={{ latitude: lat, longitude: lon }}
            title={store.display_name?.split(',')[0] || 'Plant Store'}
            description={store.display_name || 'Nearby store'}
          />
        );
      })}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;
