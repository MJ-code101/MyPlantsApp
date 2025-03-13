// screens/HomeScreen.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Plant List"
          onPress={() => navigation.navigate('PlantList')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Monitor Environment"
          onPress={() => navigation.navigate('Sensor')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { marginBottom: 20, width: '80%' },
});

export default HomeScreen;