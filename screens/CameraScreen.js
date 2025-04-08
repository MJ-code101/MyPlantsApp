import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';

const PLANT_ID_API_KEY = 'anDOM0hXjzcXfK7YbhGxIFcYzGjXxxvJs0oDfzUZni5m9xJziL';

const CameraScreen = ({ navigation }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraStatus === 'granted');
      setHasGalleryPermission(galleryStatus === 'granted');
      setHasMediaPermission(mediaStatus === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (!hasMediaPermission) {
      Alert.alert('Permission Required', 'Media Library access is needed to save your photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      try {
        await MediaLibrary.createAssetAsync(uri);
        console.log('✅ Photo saved to gallery');
      } catch (err) {
        console.warn('Could not save photo:', err);
      }

      setImageUri(uri);
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

      const suggestions = response.data?.suggestions;
      const bestMatch = suggestions?.[0];

      if (
        bestMatch &&
        bestMatch.probability >= 0.1 &&
        bestMatch.plant_name &&
        bestMatch.plant_details
      ) {
        const name = bestMatch.plant_name;
        const type = bestMatch.plant_details.common_names?.[0] || 'Indoor Plant';
        const watering = bestMatch.plant_details.watering || 'average';

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
        Alert.alert('No Plant Detected', 'Try taking a clearer photo of the plant.');
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

      <View style={styles.buttonGroup}>
        <Button title="Take Photo" onPress={takePhoto} />
        <Button title="Pick from Gallery" onPress={pickImage} />
        <Button title="Identify Plant" onPress={identifyPlant} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
});

export default CameraScreen;