import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList
} from 'react-native';
import apiClient from '../../api/client';

export default function BookingScreen({ route, navigation }) {
  const { animal, type: initialType } = route.params || {};

  const [bookingType, setBookingType] = useState(initialType || 'Feeding');
  const [visitorName, setVisitorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [date, setDate] = useState('2026-05-01'); 
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [participants, setParticipants] = useState('1');
  
  const [allSlots, setAllSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [loading, setLoading] = useState(false);

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
      
      if (slotsRes.data.success) {
        setAllSlots(slotsRes.data.data);
      }
      if (photogRes.data.success) {
        setPhotographers(photogRes.data.data.filter(p => p.isActive));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Robust filtering logic with normalization
  const availableSlots = allSlots.filter(slot => {
    // 1. Match Type (Case-insensitive)
    const sType = (slot.type || '').trim().toLowerCase();
    const bType = bookingType.trim().toLowerCase();
    if (sType !== bType) return false;

    // 2. Match Date (Trim and compare)
    let slotDateStr = slot.date;
    if (typeof slotDateStr !== 'string') {
      slotDateStr = new Date(slotDateStr).toISOString().split('T')[0];
    }
    
    if (slotDateStr.trim() !== date.trim()) return false;

    // 3. Match Availability
    if (slot.isBooked) return false;

    // 4. Match Specific Selections
    if (bookingType === 'Photography') {
      return !selectedPhotographer || slot.photographer?._id === selectedPhotographer._id;
    } else {
      const targetAnimal = (animal?.name || '').trim().toLowerCase();
      const slotAnimal = (slot.animalName || '').trim().toLowerCase();
      return slotAnimal === targetAnimal || slotAnimal === 'all';
    }
  });

  const handlePhotogSelect = (photog) => {
    setSelectedPhotographer(selectedPhotographer?._id === photog._id ? null : photog);
    setSelectedSlotId('');
  };

  const handleConfirmBooking = async () => {
    if (!visitorName.trim() || !contactInfo.trim() || !selectedSlotId) {
      Alert.alert('Details Missing', 'Please fill in your name, contact, and select a slot.');
      return;
    }

    const selectedSlot = allSlots.find(s => s._id === selectedSlotId);

    try {
      setLoading(true);
      const endpoint = bookingType === 'Feeding' ? '/feeding-bookings' : '/photography-bookings';
      const payload = bookingType === 'Feeding' 
        ? {
            visitorName,
            contactInfo,
            animalName: animal.name,
            date: selectedSlot.date,
            timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            numberOfParticipants: parseInt(participants) || 1
          }
        : {
            visitorName,
            contactInfo,
            animal: '662f9a2e8c2a3b001f7e4d5c', 
            photographer: selectedSlot.photographer?._id,
            timeSlot: selectedSlot._id,
            duration: 60,
            package: '662f9a2e8c2a3b001f7e4d5a' 
          };

      const response = await apiClient.post(endpoint, payload);
      if (response.data.success) {
        if (bookingType === 'Feeding') {
          await apiClient.patch(`/time-slots/${selectedSlot._id}`, { isBooked: true });
        }
        Alert.alert('Success!', 'Your session is booked.', [{ text: 'OK', onPress: () => navigation.navigate('Encounters') }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {animal?.image && <Image source={{ uri: animal.image }} style={styles.image} />}
          
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{animal?.name || 'Booking'}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{bookingType}</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Activity Type</Text>
              <View style={styles.tabContainer}>
                {['Feeding', 'Photography'].map(t => (
                  <TouchableOpacity 
                    key={t}
                    style={[styles.tab, bookingType === t && styles.activeTab]}
                    onPress={() => { setBookingType(t); setSelectedSlotId(''); }}
                  >
                    <Text style={[styles.tabText, bookingType === t && styles.activeTabText]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Your Details</Text>
              <TextInput style={styles.input} placeholder="Name" value={visitorName} onChangeText={setVisitorName} />
              <TextInput style={styles.input} placeholder="Phone/Email" value={contactInfo} onChangeText={setContactInfo} />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Booking Date</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-05-01" />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Available Slots</Text>
              {loading ? (
                <ActivityIndicator color="#2196F3" />
              ) : availableSlots.length > 0 ? (
                <View style={styles.slotsContainer}>
                  {availableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot._id}
                      style={[styles.slot, selectedSlotId === slot._id && styles.activeSlot]}
                      onPress={() => setSelectedSlotId(slot._id)}
                    >
                      <Text style={[styles.slotTime, selectedSlotId === slot._id && styles.activeSlotText]}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                      <Text style={[styles.slotDetail, selectedSlotId === slot._id && styles.activeSlotText]}>
                        {slot.type === 'Photography' ? (slot.photographer?.name || 'Assigned') : (slot.animalName || 'Feeding')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No {bookingType} slots for {date}.</Text>
                  <Text style={styles.emptySub}>Total slots in DB: {allSlots.length}</Text>
                  {allSlots.length > 0 && (
                    <Text style={styles.hint}>Check if animal name "{animal?.name}" matches Admin selection.</Text>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.confirmButton, !selectedSlotId && styles.disabledButton]} 
              onPress={handleConfirmBooking}
              disabled={!selectedSlotId}
            >
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
            
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  image: { width: '100%', height: 220 },
  content: { padding: 20, marginTop: -20, backgroundColor: '#F5F7FA', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  typeBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
  typeBadgeText: { color: '#2196F3', fontWeight: 'bold', fontSize: 12 },
  formSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', color: '#444', marginBottom: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#EEE', borderRadius: 8, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#FFF' },
  tabText: { color: '#666', fontWeight: 'bold' },
  activeTabText: { color: '#2196F3' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  slot: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, margin: 5, width: '46%', alignItems: 'center' },
  activeSlot: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  slotTime: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  slotDetail: { fontSize: 11, color: '#666', marginTop: 4 },
  activeSlotText: { color: '#FFF' },
  emptyContainer: { padding: 20, alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 10 },
  emptyText: { color: '#666', fontWeight: 'bold' },
  emptySub: { color: '#999', fontSize: 12, marginTop: 5 },
  hint: { color: '#2196F3', fontSize: 11, marginTop: 10, textAlign: 'center' },
  confirmButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#CCC' },
});
