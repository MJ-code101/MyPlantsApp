// AppNavigator.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import PlantListScreen from './screens/PlantListScreen';
import SensorScreen from './screens/SensorScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PlantList" component={PlantListScreen} />
        <Stack.Screen name="Sensor" component={SensorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}