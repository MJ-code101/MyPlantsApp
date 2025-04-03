import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const PlantDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const plant = route?.params?.plant;

  const [reminderSet, setReminderSet] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [repeatDays, setRepeatDays] = useState('1');
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const notificationListener = useRef();

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      scheduleNextNotification();
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, [selectedTime, repeatDays]);

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (
      (hours % 12 || 12) +
      ':' +
      (minutes < 10 ? '0' : '') +
      minutes +
      (hours >= 12 ? ' PM' : ' AM')
    );
  };

  const scheduleNotification = async () => {
    const triggerTime = calculateNextTriggerDate(0);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Water Reminder',
          body: `Time to water your ${plant.name}`,
        },
        trigger: triggerTime,
      });

      setReminderSet(true);
      Alert.alert('Success', `Reminder set for ${formatTime(triggerTime)} every ${repeatDays} day(s).`);
    } catch (error) {
      console.error('Notification error:', error);
      Alert.alert('Error', 'Failed to schedule reminder.');
    }
  };

  const scheduleNextNotification = async () => {
    const triggerTime = calculateNextTriggerDate(Number(repeatDays));
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Water Reminder',
          body: `Time to water your ${plant.name}`,
        },
        trigger: triggerTime,
      });
    } catch (error) {
      console.error('Error scheduling next notification:', error);
    }
  };

  const calculateNextTriggerDate = (offsetDays) => {
    const now = new Date();
    const nextTrigger = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offsetDays,
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0
    );

    if (offsetDays === 0 && nextTrigger < now) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }

    return nextTrigger;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{plant.name}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Type: <Text style={styles.value}>{plant.type}</Text></Text>
        <Text style={styles.label}>Location: <Text style={styles.value}>{plant.location}</Text></Text>
        <Text style={styles.label}>Health: <Text style={styles.value}>{plant.healthStatus}</Text></Text>
        <Text style={styles.label}>Needs Water: <Text style={styles.value}>{plant.needsWater ? 'Yes' : 'No'}</Text></Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeading}>Choose Reminder Time</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.optionButtonText}>🕒 {formatTime(selectedTime)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeading}>Repeat Every</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => setShowRepeatModal(true)}>
          <Text style={styles.optionButtonText}>🔁 Every {repeatDays} Day(s)</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showRepeatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRepeatModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowRepeatModal(false)}
        >
          <View style={styles.pickerModal}>
            <Picker
              selectedValue={repeatDays}
              onValueChange={(value) => {
                setRepeatDays(value);
                setShowRepeatModal(false);
              }}
              style={styles.picker}
              itemStyle={{ color: '#000', fontSize: 18 }}
            >
              <Picker.Item label="1 Day" value="1" />
              <Picker.Item label="3 Days" value="3" />
              <Picker.Item label="7 Days" value="7" />
            </Picker>
          </View>
        </TouchableOpacity>
      </Modal>

      <Button title="Set Reminder" onPress={scheduleNotification} />

      {reminderSet && (
        <Text style={styles.confirmation}>
          🔔 Reminder set for {formatTime(selectedTime)} every {repeatDays} day(s)!
        </Text>
      )}

      <TouchableOpacity
        style={styles.logButton}
        onPress={() =>
          navigation.navigate('CareLogs', {
            plantId: plant.id,
            plantName: plant.name,
          })
        }
      >
        <Text style={styles.logButtonText}>📘 View Care Logs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logButton}
        onPress={() =>
          navigation.navigate('PlantInstructions', {
            plant,
          })
        }
      >
        <Text style={styles.logButtonText}>📘 View Instructions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f9f7' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  value: { fontWeight: 'normal', color: '#333' },
  subHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  optionButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: { color: '#fff', fontSize: 16 },
  confirmation: {
    marginTop: 16,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  pickerModal: {
    margin: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
  },
  picker: {
    height: 180,
    width: '100%',
  },
  logButton: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlantDetailsScreen;
