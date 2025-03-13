// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth methods
import { auth } from '../src/firebaseConfig'; // Updated import path

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('Login');
      })
      .catch((error) => {
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
      <Button title="Sign Up" onPress={handleSignUp} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
  loginLink: { marginTop: 16, textAlign: 'center', color: '#007bff', textDecorationLine: 'underline' },
});

export default SignUpScreen;