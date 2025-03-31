import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { auth } from '../src/firebaseConfig';

const db = getFirestore();

const CareLogsScreen = ({ route, navigation }) => {
  const { plantId, plantName } = route.params;

  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('Watered');
  const [note, setNote] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: `Logs: ${plantName}` });

    const user = auth.currentUser;
    if (!user || !plantId) return;

    const logsRef = collection(db, `users/${user.uid}/plants/${plantId}/logs`);
    const q = query(logsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLog = async () => {
    if (!selectedAction) return;

    const user = auth.currentUser;
    if (!user || !plantId) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/plants/${plantId}/logs`), {
        action: selectedAction,
        note,
        timestamp: Date.now(),
      });
      setModalVisible(false);
      setSelectedAction('Watered');
      setNote('');
    } catch (err) {
      console.error('Error adding log:', err);
      Alert.alert('Error', 'Failed to add log entry.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.actionText}>• {item.action}</Text>
      <Text style={styles.dateText}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      {item.note ? <Text style={styles.noteText}>📝 {item.note}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No care logs yet for this plant.</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>➕ Add Log</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Care Log</Text>

            <View style={styles.buttonRow}>
              {['Watered', 'Fertilized', 'Pruned'].map((action) => (
                <TouchableOpacity
                  key={action}
                  style={[
                    styles.actionButton,
                    selectedAction === action && styles.activeButton,
                  ]}
                  onPress={() => setSelectedAction(action)}
                >
                  <Text
                    style={[
                      styles.actionText,
                      selectedAction === action && styles.activeText,
                    ]}
                  >
                    {action}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Optional note..."
              value={note}
              onChangeText={setNote}
              style={styles.noteInput}
              multiline
            />

            <View style={styles.modalActions}>
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
              <Button title="Add Log" onPress={handleAddLog} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  noteText: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#2e7d32',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  addButton: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeButton: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  activeText: {
    color: '#fff',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CareLogsScreen;
