import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { auth } from '../src/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Load last logged-in email from AsyncStorage
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('lastEmail');
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.error('Error loading email from storage:', error);
      }
    };
    loadEmail();
  }, []);

  // Handle user login
  const handleLogin = async () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async () => {
        // Save the email in AsyncStorage
        try {
          await AsyncStorage.setItem('lastEmail', email);
        } catch (error) {
          console.error('Error saving email:', error);
        }

        navigation.navigate('Home');
      })
      .catch((error) => Alert.alert('Login Failed', error.message));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Care Companion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupLink}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
  signupLink: { marginTop: 16, textAlign: 'center', color: '#007bff', textDecorationLine: 'underline' },
});

export default LoginScreen;
