import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const PLANT_ID_API_KEY = 'anDOM0hXjzcXfK7YbhGxIFcYzGjXxxvJs0oDfzUZni5m9xJziL';

const CameraScreen = ({ navigation }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantInfo, setPlantInfo] = useState(null);

  // Request permissions for Camera and Gallery
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setHasCameraPermission(cameraStatus === 'granted');
      setHasGalleryPermission(galleryStatus === 'granted');
    })();
  }, []);

  if (hasCameraPermission === null || hasGalleryPermission === null) {
    return <Text>Requesting permissions...</Text>;
  }
  if (!hasCameraPermission) {
    return <Text>No access to camera</Text>;
  }
  if (!hasGalleryPermission) {
    return <Text>No access to gallery</Text>;
  }

  // Take a photo
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Pick from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Identify plant using Plant.id API
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

      if (response.data.suggestions.length > 0) {
        setPlantInfo(response.data.suggestions[0]);
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

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Pick from Gallery" onPress={pickImage} />
      <Button title="Identify Plant" onPress={identifyPlant} disabled={loading} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />

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
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  image: { width: 200, height: 200, alignSelf: 'center', marginBottom: 20 },
  resultContainer: { marginTop: 20, padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
});

export default CameraScreen;
