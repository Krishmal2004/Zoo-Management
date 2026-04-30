import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import apiClient from '../../api/client';

export default function TimeSlotManagementScreen() {
  const [slots, setSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [date, setDate] = useState('2026-05-01');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [photographerId, setPhotographerId] = useState('');
  const [capacity, setCapacity] = useState('5');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, photogRes] = await Promise.all([
        apiClient.get('/time-slots'),
        apiClient.get('/photographers')
      ]);
      setSlots(slotsRes.data.data);
      setPhotographers(photogRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!photographerId) {
      Alert.alert('Error', 'Please select a photographer.');
      return;
    }

    try {
      const payload = {
        date,
        startTime,
        endTime,
        photographer: photographerId,
        capacity: parseInt(capacity)
      };
      await apiClient.post('/time-slots', payload);
      Alert.alert('Success', 'Time slot created.');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create time slot.');
    }
  };

  const renderSlot = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.slotTime}>{item.startTime} - {item.endTime}</Text>
        <Text style={styles.slotDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.slotPhotog}>📸 {item.photographer?.name || 'Assigned'}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.isBooked ? 'Booked' : 'Available'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Slots</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ New Slot</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item._id}
          renderItem={renderSlot}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Slot</Text>
            
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Start (HH:mm)</Text>
                <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End (HH:mm)</Text>
                <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} />
              </View>
            </View>

            <Text style={styles.label}>Capacity</Text>
            <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

            <Text style={styles.label}>Select Photographer</Text>
            <ScrollView horizontal style={styles.photogList}>
              {photographers.map(p => (
                <TouchableOpacity 
                  key={p._id} 
                  style={[styles.photogChip, photographerId === p._id && styles.activeChip]}
                  onPress={() => setPhotographerId(p._id)}
                >
                  <Text style={[styles.chipText, photographerId === p._id && styles.activeChipText]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                <Text style={styles.saveBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  slotTime: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  slotDate: { fontSize: 14, color: '#666' },
  slotPhotog: { fontSize: 13, color: '#2196F3', marginTop: 4 },
  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  loader: { marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 12, marginBottom: 15 },
  row: { flexDirection: 'row' },
  photogList: { flexDirection: 'row', marginBottom: 20 },
  photogChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 8 },
  activeChip: { backgroundColor: '#2196F3' },
  chipText: { color: '#666' },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666' },
  saveBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
});
