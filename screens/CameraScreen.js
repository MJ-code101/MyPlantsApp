// CameraScreen.js
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

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
      setHasGalleryPermission(galleryStatus === 'granted');
    })();
  }, []);

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

  const identifyPlant = async () => {
    if (!imageUri) return Alert.alert('Please select or take a photo.');

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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.suggestions?.length > 0) {
        const plant = response.data.suggestions[0];
        const name = plant?.plant_name || 'Unknown Plant';
        const type = plant?.plant_details?.common_names?.[0] || 'Indoor Plant';
        const watering = plant?.plant_details?.watering || 'average';

        let suggestedRepeatDays = '3';
        if (watering === 'frequent') suggestedRepeatDays = '1';
        else if (watering === 'minimum') suggestedRepeatDays = '7';

        navigation.navigate('AddPlant', {
          prefillData: {
            name,
            type,
            suggestedRepeatDays,
          },
        });
      } else {
        Alert.alert('No Results', 'Could not identify the plant.');
      }
    } catch (error) {
      console.error('Identification Error:', error);
      Alert.alert('Error', 'Could not identify the plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identify a Plant</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Pick from Gallery" onPress={pickImage} />
      <Button title="Identify Plant" onPress={identifyPlant} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#007bff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  image: { width: 200, height: 200, alignSelf: 'center', marginBottom: 20 },
});

export default CameraScreen;
