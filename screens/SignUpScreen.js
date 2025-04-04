// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth methods
import { auth } from '../src/firebaseConfig'; // Import auth from firebaseConfig

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle user signup
  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    // Create a new user with email and password using Firebase
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Show success message and navigate to Login screen
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('Login');
      })
      .catch((error) => {
        // Handle errors (e.g., invalid email, weak password, etc.)
        Alert.alert('Signup Failed', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
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
     <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
  <Text style={styles.signupButtonText}>Sign Up</Text>
</TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f8e4',
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
  loginLink: {
    marginTop: 16,
    textAlign: 'center',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default SignUpScreen;