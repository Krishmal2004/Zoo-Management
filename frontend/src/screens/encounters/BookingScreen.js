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
  ActivityIndicator,
  FlatList,
  Linking
} from 'react-native';
import apiClient from '../../api/client';

export default function BookingScreen({ route, navigation }) {
  const { animal, type: initialType } = route.params || {};

  const [bookingType, setBookingType] = useState(initialType || 'Feeding');
  const [visitorName, setVisitorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  
  const [allSlots, setAllSlots] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
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
      if (slotsRes.data.success) setAllSlots(slotsRes.data.data);
      if (photogRes.data.success) setPhotographers(photogRes.data.data.filter(p => p.isActive));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = allSlots.filter(slot => {
    if ((slot.type || '').toLowerCase() !== bookingType.toLowerCase()) return false;
    let slotDateStr = slot.date;
    if (typeof slotDateStr !== 'string') slotDateStr = new Date(slotDateStr).toISOString().split('T')[0];
    if (slotDateStr !== date) return false;
    if (slot.isBooked) return false;
    if (bookingType === 'Photography') {
      if (selectedPhotographer && slot.photographer?._id !== selectedPhotographer._id) return false;
      return true;
    } else {
      const targetAnimal = (animal?.name || '').toLowerCase();
      const slotAnimal = (slot.animalName || '').toLowerCase();
      return slotAnimal === targetAnimal || slotAnimal === 'all';
    }
  });

  const handleConfirmBooking = async () => {
    if (!visitorName.trim() || !contactInfo.trim() || !selectedSlotId) {
      Alert.alert('Error', 'Please fill in your name, contact, and select a slot.');
      return;
    }

    try {
      setLoading(true);
      const selectedSlot = allSlots.find(s => s._id === selectedSlotId);
      const endpoint = bookingType === 'Feeding' ? '/feeding-bookings' : '/photography-bookings';
      
      const payload = bookingType === 'Feeding' 
        ? {
            visitorName,
            contactInfo,
            animalName: animal?.name || 'Zoo Animal',
            date: selectedSlot.date,
            timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            numberOfParticipants: 1
          }
        : {
            visitorName,
            contactInfo,
            animal: '662f9a2e8c2a3b001f7e4d5c', // Placeholder ID required by schema
            photographer: selectedSlot.photographer?._id,
            timeSlot: selectedSlot._id,
            date: selectedSlot.date,
            time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            duration: 60,
            package: '662f9a2e8c2a3b001f7e4d5a' // Placeholder ID
          };

      const response = await apiClient.post(endpoint, payload);
      
      if (response.data.success) {
        // Mark the slot as booked locally so it disappears from UI
        await apiClient.patch(`/time-slots/${selectedSlot._id}`, { isBooked: true });
        
        Alert.alert(
          'Success!', 
          'Your booking has been received. The admin will see it shortly.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Booking Error:', error);
      Alert.alert('Booking Failed', 'There was a problem connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const renderPhotographer = ({ item }) => (
    <TouchableOpacity 
      style={[styles.photogCard, selectedPhotographer?._id === item._id && styles.activePhotog]}
      onPress={() => {
        setSelectedPhotographer(selectedPhotographer?._id === item._id ? null : item);
        setSelectedSlotId('');
      }}
    >
      <Text style={styles.photogName}>{item.name}</Text>
      <Text style={styles.photogSub}>{item.specialty || 'Generalist'}</Text>
      <Text style={styles.photogPrice}>Rs.{item.hourlyRate}/hr</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {animal?.image && <Image source={{ uri: animal.image }} style={styles.heroImage} />}
        
        <View style={styles.content}>
          <Text style={styles.title}>{animal?.name} - {bookingType}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={visitorName} onChangeText={setVisitorName} placeholder="Enter name" />
            
            <Text style={styles.label}>Contact Info</Text>
            <TextInput style={styles.input} value={contactInfo} onChangeText={setContactInfo} placeholder="Phone or Email" />

            <Text style={styles.label}>Select Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />
          </View>

          {bookingType === 'Photography' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Photographer</Text>
              <FlatList
                horizontal
                data={photographers}
                keyExtractor={item => item._id}
                renderItem={renderPhotographer}
                showsHorizontalScrollIndicator={false}
              />

              {selectedPhotographer && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsTitle}>{selectedPhotographer.name}'s Portfolio</Text>
                  {selectedPhotographer.portfolio && selectedPhotographer.portfolio.length > 0 ? (
                    selectedPhotographer.portfolio.map((link, idx) => (
                      <TouchableOpacity key={idx} onPress={() => Linking.openURL(link)}>
                        <Text style={styles.linkText}>🔗 View Gallery {idx + 1}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{ color: '#999' }}>No portfolio links.</Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            {loading && <ActivityIndicator color="#2196F3" />}
            <View style={styles.slotsGrid}>
              {availableSlots.length > 0 ? availableSlots.map(slot => (
                <TouchableOpacity 
                  key={slot._id} 
                  style={[styles.slotItem, selectedSlotId === slot._id && styles.activeSlot]} 
                  onPress={() => setSelectedSlotId(slot._id)}
                >
                  <Text style={[styles.slotTime, selectedSlotId === slot._id && styles.activeText]}>{slot.startTime} - {slot.endTime}</Text>
                  {bookingType === 'Photography' && !selectedPhotographer && (
                    <Text style={[styles.slotSub, selectedSlotId === slot._id && styles.activeText]}>{slot.photographer?.name}</Text>
                  )}
                </TouchableOpacity>
              )) : (
                <Text style={styles.emptyText}>No available slots.</Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtn, (!selectedSlotId || loading) && styles.disabledBtn]} 
            onPress={handleConfirmBooking}
            disabled={!selectedSlotId || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  heroImage: { width: '100%', height: 200 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 25 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  photogCard: { width: 140, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, marginRight: 15, borderWidth: 1, borderColor: '#EEE' },
  activePhotog: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  photogName: { fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  photogSub: { fontSize: 12, color: '#666', marginBottom: 5 },
  photogPrice: { fontSize: 13, color: '#2196F3', fontWeight: 'bold' },
  detailsBox: { marginTop: 20, backgroundColor: '#F0F7FF', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  detailsTitle: { fontSize: 14, fontWeight: 'bold', color: '#2196F3', marginBottom: 10 },
  linkText: { color: '#007AFF', fontSize: 14, marginBottom: 8, textDecorationLine: 'underline' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotItem: { width: '46%', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, margin: '2%', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  activeSlot: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  slotTime: { fontSize: 15, fontWeight: 'bold' },
  slotSub: { fontSize: 10, color: '#999', marginTop: 4 },
  activeText: { color: '#FFF' },
  confirmBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#DDD' },
  emptyText: { color: '#999', textAlign: 'center', width: '100%', padding: 10 },
});
