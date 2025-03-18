import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const db = getFirestore();

const PlantListScreen = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/plants`));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const plantsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPlants(plantsData);
      setLoading(false);

      // Save plant data to AsyncStorage for offline access
      try {
        await AsyncStorage.setItem('cachedPlants', JSON.stringify(plantsData));
      } catch (error) {
        console.error('Error saving plant data:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load cached data when offline
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('cachedPlants');
        if (cachedData) {
          setPlants(JSON.parse(cachedData));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading cached plant data:', error);
      }
    };

    loadCachedData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>Type: {item.type}</Text>
      <Text style={styles.details}>Location: {item.location}</Text>
      {item.notes && <Text style={styles.details}>Notes: {item.notes}</Text>}
      <Text style={styles.details}>Date Added: {new Date(item.dateAdded).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={plants}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 16, marginBottom: 8, backgroundColor: '#f9f9f9', borderRadius: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#555' },
});

export default PlantListScreen;
