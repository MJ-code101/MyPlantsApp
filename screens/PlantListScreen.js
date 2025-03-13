// screens/PlantListScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const PlantListScreen = ({ route }) => {
  // Mock plant data (replace with data from Firestore or another source)
  const plants = [
    { id: '1', name: 'Rose', type: 'Flower', location: 'Garden', notes: 'Needs daily watering', dateAdded: '2023-10-01T12:00:00Z' },
    { id: '2', name: 'Cactus', type: 'Succulent', location: 'Living Room', notes: 'Water once a week', dateAdded: '2023-10-02T12:00:00Z' },
  ];

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
      <FlatList
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
});

export default PlantListScreen;