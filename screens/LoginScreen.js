import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker for dropdown
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { auth } from '../src/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [savedEmails, setSavedEmails] = useState([]); // Store multiple emails

  // Load stored emails from AsyncStorage
  useEffect(() => {
    const loadEmails = async () => {
      try {
        const storedEmails = await AsyncStorage.getItem('savedEmails');
        if (storedEmails) {
          const emailList = JSON.parse(storedEmails);
          setSavedEmails(emailList);
        }
      } catch (error) {
        console.error('Error loading emails:', error);
      }
    };

    loadEmails();
    setEmail(''); // Ensure email input is cleared on logout
    setPassword(''); // Clear password field on screen load
  }, []);

  // Save new email in AsyncStorage
  const saveEmail = async (newEmail) => {
    try {
      const storedEmails = await AsyncStorage.getItem('savedEmails');
      let emailList = storedEmails ? JSON.parse(storedEmails) : [];

      if (!emailList.includes(newEmail)) {
        emailList.push(newEmail); // Add new email only if not already stored
        await AsyncStorage.setItem('savedEmails', JSON.stringify(emailList));
      }
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  // Handle user login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await saveEmail(email); // Save email to AsyncStorage

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Care Companion</Text>

      {/* Dropdown for past emails */}
      {savedEmails.length > 0 && (
        <Picker
          selectedValue={email}
          onValueChange={(selectedEmail) => setEmail(selectedEmail)}
          style={styles.picker}
        >
          <Picker.Item label="Select an email" value="" />
          {savedEmails.map((storedEmail, index) => (
            <Picker.Item key={index} label={storedEmail} value={storedEmail} />
          ))}
        </Picker>
      )}

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <Button title="Login" onPress={handleLogin} />

      {/* Sign-Up Link */}
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
  picker: { marginBottom: 12, backgroundColor: '#fff' },
});

export default LoginScreen;
