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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
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
      if (slotsRes.data.success) setAllSlots(slotsRes.data.data);
      if (photogRes.data.success) {
        setPhotographers(photogRes.data.data.filter(p => p.isActive));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter slots by type, date, availability, and selected photographer/animal
  const availableSlots = allSlots.filter(slot => {
    // 1. Match Type
    if (slot.type !== bookingType) return false;

    // 2. Match Date (compare YYYY-MM-DD only)
    const slotDateStr = new Date(slot.date).toISOString().split('T')[0];
    if (slotDateStr !== date) return false;

    // 3. Match Availability
    if (slot.isBooked) return false;

    // 4. Match Specific Selections
    if (bookingType === 'Photography') {
      return !selectedPhotographer || slot.photographer?._id === selectedPhotographer._id;
    } else {
      // For Feeding, show slots for this specific animal or "All"
      return !animal || slot.animalName === animal.name || slot.animalName === 'All';
    }
  });

  const handlePhotogSelect = (photog) => {
    if (selectedPhotographer?._id === photog._id) {
      setSelectedPhotographer(null);
    } else {
      setSelectedPhotographer(photog);
    }
    setSelectedSlotId('');
  };

  if (!animal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No animal data found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConfirmBooking = async () => {
    if (!visitorName.trim() || !contactInfo.trim() || !selectedSlotId) {
      Alert.alert('Missing Fields', 'Please fill in all fields before confirming.');
      return;
    }

    const selectedSlot = allSlots.find(s => s._id === selectedSlotId);

    try {
      const endpoint = bookingType === 'Feeding' ? '/feeding-bookings' : '/photography-bookings';
      
      const payload = bookingType === 'Feeding' 
        ? {
            visitorName,
            contactInfo,
            animalName: animal.name,
            date: selectedSlot.date,
            timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            numberOfParticipants: parseInt(participants)
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
        // If it's a feeding booking, we might want to mark the slot as booked too
        // (Though the service usually handles this for photography, we do it here for demo consistency)
        if (bookingType === 'Feeding') {
          await apiClient.patch(`/time-slots/${selectedSlot._id}`, { isBooked: true });
        }

        Alert.alert(
          'Booking Success!',
          `Successfully booked a ${bookingType} session for ${animal.name}.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Encounters') }]
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to confirm booking.');
    }
  };

  const renderPhotographer = ({ item }) => (
    <TouchableOpacity 
      style={[styles.photogChip, selectedPhotographer?._id === item._id && styles.activePhotogChip]}
      onPress={() => handlePhotogSelect(item)}
    >
      <Text style={[styles.photogChipText, selectedPhotographer?._id === item._id && styles.activePhotogText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: animal.image }} style={styles.image} />
          
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{animal.name}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{bookingType}</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Select Activity</Text>
              <View style={styles.tabContainer}>
                {['Feeding', 'Photography'].map(t => (
                  <TouchableOpacity 
                    key={t}
                    style={[styles.tab, bookingType === t && styles.activeTab]}
                    onPress={() => { setBookingType(t); setSelectedSlotId(''); setSelectedPhotographer(null); }}
                  >
                    <Text style={[styles.tabText, bookingType === t && styles.activeTabText]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Visitor Details</Text>
              <TextInput style={styles.input} placeholder="Your Name" value={visitorName} onChangeText={setVisitorName} />
              <TextInput style={styles.input} placeholder="Contact Info" value={contactInfo} onChangeText={setContactInfo} />
            </View>

            {bookingType === 'Feeding' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Participants (Max 20)</Text>
                <TextInput 
                  style={styles.input} 
                  value={participants} 
                  onChangeText={setParticipants} 
                  keyboardType="numeric" 
                  placeholder="1"
                />
              </View>
            )}

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Booking Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-05-01" />
            </View>

            {bookingType === 'Photography' && (
              <>
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>Our Photographers</Text>
                  <FlatList
                    data={photographers}
                    renderItem={renderPhotographer}
                    keyExtractor={item => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photogList}
                  />
                </View>

                {selectedPhotographer && (
                  <View style={styles.photogSpotlight}>
                    <View style={styles.spotlightHeader}>
                      <Text style={styles.spotlightName}>{selectedPhotographer.name}</Text>
                      <Text style={styles.spotlightRate}>Rs.{selectedPhotographer.hourlyRate}/hr</Text>
                    </View>
                    <Text style={styles.spotlightSpecialty}>Specialty: {selectedPhotographer.specialty}</Text>
                    <Text style={styles.spotlightRating}>⭐ {selectedPhotographer.rating} ({selectedPhotographer.ratingCount} reviews)</Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Available {bookingType} Slots</Text>
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
                      <Text style={[styles.slotPhotog, selectedSlotId === slot._id && styles.activeSlotText]}>
                        {slot.type === 'Photography' ? (slot.photographer?.name || 'Assigned') : (slot.animalName || 'Feeding')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noSlotsText}>No {bookingType.toLowerCase()} slots available for this selection.</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.confirmButton, !selectedSlotId && styles.disabledButton]} 
              onPress={handleConfirmBooking}
              disabled={!selectedSlotId}
            >
              <Text style={styles.confirmButtonText}>Confirm {bookingType} Booking</Text>
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
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: '#666', marginBottom: 20 },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#2196F3', borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
  image: { width: '100%', height: 220, resizeMode: 'cover' },
  content: { padding: 20, marginTop: -20, backgroundColor: '#F5F7FA', borderTopLeftRadius: 25, borderTopRightRadius: 25, flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  typeBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeBadgeText: { color: '#2196F3', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  formSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#EEE', borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#FFF', elevation: 2 },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#2196F3' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 10 },
  photogList: { paddingVertical: 5 },
  photogChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', marginRight: 10 },
  activePhotogChip: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  photogChipText: { color: '#666', fontWeight: '600' },
  activePhotogText: { color: '#FFF' },
  photogSpotlight: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E3F2FD' },
  spotlightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  spotlightName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  spotlightRate: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  spotlightSpecialty: { fontSize: 14, color: '#666', marginBottom: 4 },
  spotlightRating: { fontSize: 14, color: '#FFA000', fontWeight: '600' },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  slot: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, margin: 5, width: '47%', alignItems: 'center' },
  activeSlot: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  slotTime: { color: '#444', fontSize: 14, fontWeight: 'bold' },
  slotPhotog: { color: '#666', fontSize: 11, marginTop: 4 },
  activeSlotText: { color: '#FFF' },
  noSlotsText: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 },
  confirmButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#CCC' },
});
