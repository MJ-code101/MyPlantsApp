import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../src/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [savedEmails, setSavedEmails] = useState([]);

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
    setEmail('');
    setPassword('');
  }, []);

  const saveEmail = async (newEmail) => {
    try {
      const storedEmails = await AsyncStorage.getItem('savedEmails');
      let emailList = storedEmails ? JSON.parse(storedEmails) : [];

      if (!emailList.includes(newEmail)) {
        emailList.push(newEmail);
        await AsyncStorage.setItem('savedEmails', JSON.stringify(emailList));
      }
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await saveEmail(email);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Plant Care Companion</Text>

          {savedEmails.length > 0 && (
            <Picker
              selectedValue={email}
              onValueChange={setEmail}
              style={styles.picker}
            >
              <Picker.Item label="Select an email" value="" />
              {savedEmails.map((storedEmail, index) => (
                <Picker.Item key={index} label={storedEmail} value={storedEmail} />
              ))}
            </Picker>
          )}

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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
    justifyContent: 'center',
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
  signupLink: {
    marginTop: 16,
    textAlign: 'center',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  picker: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
});

export default LoginScreen;
