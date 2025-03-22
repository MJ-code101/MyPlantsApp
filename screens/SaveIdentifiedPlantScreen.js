// screens/SaveIdentifiedPlantScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';

const db = getFirestore();

const SaveIdentifiedPlantScreen = ({ route, navigation }) => {
  const { name, type } = route.params || {};

  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [needsWater, setNeedsWater] = useState('no');

  const handleSave = async () => {
    if (!name || !type || !location) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/plants`), {
        name,
        type,
        location,
        notes,
        healthStatus,
        needsWater: needsWater === 'yes',
        dateAdded: new Date().toISOString(),
      });

      Alert.alert('Success', 'Plant saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to save plant.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Save Identified Plant</Text>
      <Text style={styles.label}>Plant Name: {name}</Text>
      <Text style={styles.label}>Type: {type}</Text>

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Text style={styles.label}>Is the plant healthy?</Text>
      <Picker
        selectedValue={healthStatus}
        onValueChange={(itemValue) => setHealthStatus(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Healthy" value="healthy" />
        <Picker.Item label="Unhealthy" value="unhealthy" />
      </Picker>

      <Text style={styles.label}>Does the plant need water?</Text>
      <Picker
        selectedValue={needsWater}
        onValueChange={(itemValue) => setNeedsWater(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Yes" value="yes" />
        <Picker.Item label="No" value="no" />
      </Picker>

      <Button title="Save Plant" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9f9f9', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 12 },
  input: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});

export default SaveIdentifiedPlantScreen;
