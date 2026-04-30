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
  ScrollView,
  Switch
} from 'react-native';
import apiClient from '../../api/client';

export default function PhotographerManagementScreen() {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [availability, setAvailability] = useState('');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/photographers');
      if (response.data.success) {
        setPhotographers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching photographers:', error);
      Alert.alert('Error', 'Failed to load photographers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !contact.trim()) {
      Alert.alert('Error', 'Name and contact are required.');
      return;
    }

    const payload = {
      name,
      contactInfo: contact,
      specialty,
      hourlyRate: parseFloat(hourlyRate) || 0,
      isActive,
      availability: availability.split(',').map(s => s.trim()).filter(Boolean),
      portfolio: portfolio.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        await apiClient.patch(`/photographers/${editingId}`, payload);
        Alert.alert('Success', 'Photographer updated successfully.');
      } else {
        await apiClient.post('/photographers', payload);
        Alert.alert('Success', 'Photographer added successfully.');
      }
      setModalVisible(false);
      resetForm();
      fetchPhotographers();
    } catch (error) {
      console.error('Error saving photographer:', error);
      Alert.alert('Error', 'Failed to save photographer.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this photographer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/photographers/${id}`);
              fetchPhotographers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photographer.');
            }
          }
        }
      ]
    );
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setName(item.name);
    setContact(item.contactInfo || '');
    setSpecialty(item.specialty || '');
    setAvailability(item.availability ? item.availability.join(', ') : '');
    setHourlyRate(item.hourlyRate?.toString() || '0');
    setIsActive(item.isActive ?? true);
    setPortfolio(item.portfolio ? item.portfolio.join(', ') : '');
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setContact('');
    setSpecialty('');
    setAvailability('');
    setHourlyRate('0');
    setIsActive(true);
    setPortfolio('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.statusText, { color: item.isActive ? '#2E7D32' : '#C62828' }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardSub}>{item.contactInfo || 'No contact'}</Text>
        <Text style={styles.cardSub}>{item.specialty} • ${item.hourlyRate}/hr</Text>
        <Text style={styles.cardSub}>⭐ {item.rating} ({item.ratingCount} reviews)</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photographers</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { resetForm(); setModalVisible(true); }}
        >
          <Text style={styles.addBtnText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={photographers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No photographers found.</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Photographer' : 'Add Photographer'}</Text>

              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />

              <Text style={styles.label}>Contact Info *</Text>
              <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="Email or Phone" />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Specialty</Text>
                  <TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} placeholder="Nature" />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.label}>Hourly (Rs.)</Text>
                  <TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.label}>Availability (comma separated)</Text>
              <TextInput style={styles.input} value={availability} onChangeText={setAvailability} placeholder="Mon, Tue" />

              <Text style={styles.label}>Portfolio URLs (comma separated)</Text>
              <TextInput style={styles.input} value={portfolio} onChangeText={setPortfolio} placeholder="http://image1.jpg, ..." />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Account Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: '#4CAF50' }} />
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  addBtn: { backgroundColor: '#2196F3', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold' },
  list: { padding: 15 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 2 },
  cardActions: { flexDirection: 'row' },
  editBtn: { padding: 8, marginRight: 5 },
  editBtnText: { color: '#2196F3', fontWeight: '600' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: '#F44336', fontWeight: '600' },
  loader: { marginTop: 50 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingVertical: 5 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
});
