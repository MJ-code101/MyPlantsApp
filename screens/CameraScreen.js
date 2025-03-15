// screens/CameraScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const PLANT_ID_API_KEY = 'anDOM0hXjzcXfK7YbhGxIFcYzGjXxxvJs0oDfzUZni5m9xJziL'; 

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantInfo, setPlantInfo] = useState(null);

  // Request camera permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    requestPermissions();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permissions...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Set the image URI
    }
  };

  // Function to take a photo using the camera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Set the image URI
    }
  };

  // Function to identify the plant using Plant.id API
  const identifyPlant = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select or take a photo first.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('images', {
        uri: imageUri,
        name: 'plant.jpg',
        type: 'image/jpeg',
      });
      formData.append('modifiers', ['crops_fast', 'similar_images']);
      formData.append('language', 'en');
      formData.append('api_key', PLANT_ID_API_KEY);

      const response = await axios.post('https://api.plant.id/v2/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const suggestions = response.data.suggestions;
      if (suggestions.length > 0) {
        setPlantInfo(suggestions[0]); // Display the top suggestion
      } else {
        Alert.alert('No Results', 'Could not identify the plant.');
      }
    } catch (error) {
      console.error('Error identifying plant:', error);
      Alert.alert('Error', 'Failed to identify the plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Identification</Text>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Selected Image:</Text>
          <Text>{imageUri}</Text>
        </View>
      ) : (
        <Text style={styles.label}>No image selected</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Pick from Gallery" onPress={pickImage} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Identify Plant" onPress={identifyPlant} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {plantInfo && (
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Plant Name:</Text>
          <Text>{plantInfo.plant_name}</Text>
          <Text style={styles.label}>Probability:</Text>
          <Text>{(plantInfo.probability * 100).toFixed(2)}%</Text>
          <Text style={styles.label}>Details:</Text>
          <Text>{JSON.stringify(plantInfo.details, null, 2)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default CameraScreen;