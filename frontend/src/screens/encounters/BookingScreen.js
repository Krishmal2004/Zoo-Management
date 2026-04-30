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
        // Only show active photographers to users
        setPhotographers(photogRes.data.data.filter(p => p.isActive));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter slots by selected date, availability, and selected photographer
  const availableSlots = allSlots.filter(slot => {
    const slotDate = new Date(slot.date).toISOString().split('T')[0];
    const matchesDate = slotDate === date;
    const matchesPhotog = !selectedPhotographer || slot.photographer?._id === selectedPhotographer._id;
    return matchesDate && !slot.isBooked && (bookingType === 'Feeding' || matchesPhotog);
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
        Alert.alert(
          'Booking Success!',
          `Successfully booked a ${bookingType} session.`,
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
              <Text style={styles.sectionLabel}>Booking Type</Text>
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

                    {selectedPhotographer.portfolio && selectedPhotographer.portfolio.length > 0 && (
                      <View style={styles.portfolioSection}>
                        <Text style={styles.portfolioLabel}>Portfolio Preview:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {selectedPhotographer.portfolio.map((url, idx) => (
                            <Image key={idx} source={{ uri: url }} style={styles.portfolioThumb} />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Available Time Slots</Text>
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
                        {slot.photographer?.name || 'Assigned'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noSlotsText}>No slots available for this selection.</Text>
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
  photogSpotlight: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E3F2FD', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  spotlightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  spotlightName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  spotlightRate: { fontSize: 16, color: '#4CAF50', fontWeight: '700' },
  spotlightSpecialty: { fontSize: 14, color: '#666', marginBottom: 4 },
  spotlightRating: { fontSize: 14, color: '#FFA000', fontWeight: '600' },
  portfolioSection: { marginTop: 12 },
  portfolioLabel: { fontSize: 12, color: '#999', marginBottom: 8, textTransform: 'uppercase', fontWeight: 'bold' },
  portfolioThumb: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
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
