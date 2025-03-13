// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth methods
import { auth } from '../src/firebaseConfig'; // Updated import path

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigation.navigate('Home'))
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