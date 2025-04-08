import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = getFirestore();

const PlantListScreen = ({ navigation }) => {
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

      await AsyncStorage.setItem('cachedPlants', JSON.stringify(plantsData));
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (plantId) => {   //hold deletion function
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this plant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              await deleteDoc(doc(db, `users/${user.uid}/plants/${plantId}`));
              Alert.alert('Deleted', 'Plant removed successfully.');
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Failed to delete plant.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (   //get uri image as a preview
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('PlantDetails', { plant: item })}
      onLongPress={() => handleDelete(item.id)}
    >
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>Type: {item.type}</Text>
        <Text style={styles.details}>Location: {item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <Text style={styles.deleteHint}>
            📌 Tip: Long press a plant to delete it from your list.
          </Text>
          <Text style={styles.deleteHint}>
            📌 Tip: Normal press a plant to view more details.
          </Text>

          <FlatList
            data={plants}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 1,
    borderWidth: 1.5,
    borderColor: '#d4d2d2',
  },
  
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  noImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noImageText: {
    fontSize: 12,
    color: '#555',
  },
  detailsContainer: {
    flex: 1,
  },
  deleteHint: {
    fontSize: 16,
    color: '#666',
    marginTop: 30,
    marginBottom: 12,
    textAlign: 'center',
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#555' },
});

export default PlantListScreen;
