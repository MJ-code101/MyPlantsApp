import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';

const db = getFirestore();

const AddPlantScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [needsWater, setNeedsWater] = useState('no');

  const handleAddPlant = async () => {
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

      Alert.alert('Success', 'Plant added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding plant:', error);
      Alert.alert('Error', 'Failed to add plant.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add a New Plant</Text>

        <TextInput
          style={styles.input}
          placeholder="Plant Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Plant Type"
          value={type}
          onChangeText={setType}
        />
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

        <Button title="Add Plant" onPress={handleAddPlant} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  scrollContainer: { 
    padding: 16, 
    paddingBottom: 50 // Ensures space for the button on small screens
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  input: { 
    marginBottom: 12, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    backgroundColor: '#fff' 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 12, 
    marginBottom: 8 
  },
  picker: { 
    marginBottom: 12, 
    padding: 8, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    backgroundColor: '#fff' 
  },
});

export default AddPlantScreen;
