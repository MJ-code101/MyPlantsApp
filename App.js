// App.js
import React, { useEffect } from 'react';
import AppNavigator from './AppNavigator';
import * as Notifications from 'expo-notifications';

// Configure how notifications should behave
export default function App() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  return <AppNavigator />;
}
