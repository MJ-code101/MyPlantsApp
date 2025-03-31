import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';

const db = getFirestore();

const AddPlantScreen = ({ navigation, route }) => {
  const prefillData = route?.params?.prefillData || {};

  const [name, setName] = useState(prefillData.name || '');
  const [type, setType] = useState(prefillData.type || '');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [needsWater, setNeedsWater] = useState('no');
  const [suggestedRepeatDays, setSuggestedRepeatDays] = useState(
    prefillData.suggestedRepeatDays || '3'
  );

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
      const newPlantRef = await addDoc(collection(db, `users/${user.uid}/plants`), {
        name,
        type,
        location,
        notes,
        healthStatus,
        needsWater: needsWater === 'yes',
        dateAdded: new Date().toISOString(),
        imageUri: imageUri || '', // ✅ save image URI
      });

      Alert.alert('Success', 'Plant added successfully!');

      if (needsWater === 'yes') {
        navigation.navigate('PlantDetails', {
          plant: {
            id: newPlantRef.id,
            name,
            type,
            location,
            notes,
            healthStatus,
            needsWater: true,
            imageUri: imageUri || '',
          },
          suggestedRepeatDays,
        });
      } else {
        navigation.navigate('PlantList');
      }
    } catch (error) {
      console.error('Error adding plant:', error);
      Alert.alert('Error', 'Failed to add plant.');
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera roll access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add a New Plant</Text>

        <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePlaceholder}>📷 Tap to select image</Text>
          )}
        </TouchableOpacity>

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
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  picker: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: 160,
    height: 160,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#888',
    backgroundColor: '#e0e0e0',
    padding: 50,
    borderRadius: 10,
    textAlign: 'center',
    width: 160,
    height: 160,
  },
});

export default AddPlantScreen;
