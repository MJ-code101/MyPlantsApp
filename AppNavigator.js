import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import PlantListScreen from './screens/PlantListScreen';
import AddPlantScreen from './screens/AddPlantScreen';
import CameraScreen from './screens/CameraScreen';
import SaveIdentifiedPlantScreen from './screens/SaveIdentifiedPlantScreen';
import PlantDetailsScreen from './screens/PlantDetailsScreen';
import CareLogsScreen from './screens/CareLogsScreen'; // ✅ New

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'PlantList':
              iconName = focused ? 'leaf' : 'leaf-outline';
              break;
            case 'AddPlant':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Camera':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="PlantList" component={PlantListScreen} />
      <Tab.Screen name="AddPlant" component={AddPlantScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="SaveIdentifiedPlant" component={SaveIdentifiedPlantScreen} />
        <Stack.Screen name="PlantDetails" component={PlantDetailsScreen} />
        <Stack.Screen name="CareLogs" component={CareLogsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
