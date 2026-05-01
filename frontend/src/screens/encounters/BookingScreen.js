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
  const [packages, setPackages] = useState([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, photogRes, pkgRes] = await Promise.all([
        apiClient.get('/time-slots'),
        apiClient.get('/photographers'),
        apiClient.get('/photography-packages')
      ]);
      if (slotsRes.data.success) setAllSlots(slotsRes.data.data);
      if (photogRes.data.success) setPhotographers(photogRes.data.data.filter(p => p.isActive));
      if (pkgRes.data.success) setPackages(pkgRes.data.data.filter(p => !p.isArchived));
    } catch (error) {
      console.error('Fetch error:', error);
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
    // FORM VALIDATION
    if (!visitorName.trim() || visitorName.trim().length < 2) {
      Alert.alert('Name Required', 'Please enter a name with at least 2 characters.');
      return;
    }
    if (!contactInfo.trim() || contactInfo.trim().length < 3) {
      Alert.alert('Contact Required', 'Please enter a valid contact number (at least 3 digits).');
      return;
    }
    if (!selectedSlotId) {
      Alert.alert('Select a Time', 'Please pick a time slot for your encounter.');
      return;
    }

    if (bookingType === 'Photography' && !selectedPackage) {
      Alert.alert('Select Package', 'Please pick a photography package to continue.');
      return;
    }

    try {
      setLoading(true);
      const selectedSlot = allSlots.find(s => s._id === selectedSlotId);
      const endpoint = bookingType === 'Feeding' ? '/feeding-bookings' : '/photography-bookings';
      
      const payload = bookingType === 'Feeding' 
        ? {
            visitorName: visitorName.trim(),
            contactInfo: contactInfo.trim(),
            animalName: animal?.name || 'Zoo Animal',
            date: selectedSlot.date,
            timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
            numberOfParticipants: 1
          }
        : {
            visitorName: visitorName.trim(),
            contactInfo: contactInfo.trim(),
            animal: animal?._id,
            photographer: selectedSlot.photographer?._id || selectedPhotographer?._id,
            timeSlot: selectedSlot._id,
            date: selectedSlot.date,
            time: selectedSlot.startTime, 
            duration: selectedPackage.duration || 60,
            package: selectedPackage._id
          };

      const response = await apiClient.post(endpoint, payload);
      
      if (response.data.success) {
        // Mark the slot as booked
        await apiClient.patch(`/time-slots/${selectedSlot._id}`, { isBooked: true });
        
        Alert.alert(
          'Booking Confirmed! ✨', 
          'Your encounter has been successfully scheduled. See you at the zoo!',
          [{ text: 'Great!', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Booking Refused', response.data.message || 'The server could not process this booking.');
      }
    } catch (error) {
      console.error('Booking Error:', error.response?.data || error.message);
      const serverMsg = error.response?.data?.message || 'Check your network and try again.';
      Alert.alert('Booking Error', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderPhotographer = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chip, selectedPhotographer?._id === item._id && styles.activeChip]}
      onPress={() => {
        setSelectedPhotographer(selectedPhotographer?._id === item._id ? null : item);
        setSelectedSlotId('');
      }}
    >
      <Text style={[styles.chipText, selectedPhotographer?._id === item._id && styles.activeChipText]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPackage = ({ item }) => (
    <TouchableOpacity 
      style={[styles.packageCard, selectedPackage?._id === item._id && styles.activePackage]}
      onPress={() => setSelectedPackage(item)}
    >
      <Text style={styles.packageName}>{item.name}</Text>
      <Text style={styles.packageDetail}>{item.duration} mins • {item.photoCount} photos</Text>
      <Text style={styles.packagePrice}>Rs.{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {animal?.imageUrl && (
          <Image 
            source={{ uri: animal.imageUrl.startsWith('http') ? animal.imageUrl : `http://192.168.1.203:5000${animal.imageUrl}` }} 
            style={styles.heroImage} 
          />
        )}
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{animal?.name}</Text>
            <View style={styles.typeBadge}><Text style={styles.typeText}>{bookingType}</Text></View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={visitorName} onChangeText={setVisitorName} placeholder="Enter your name" />
            
            <Text style={styles.label}>Contact (Phone/Email)</Text>
            <TextInput style={styles.input} value={contactInfo} onChangeText={setContactInfo} placeholder="e.g. 077 123 4567" />

            <Text style={styles.label}>Preferred Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />
          </View>

          {bookingType === 'Photography' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Select Package</Text>
                <FlatList
                  horizontal
                  data={packages}
                  keyExtractor={item => item._id}
                  renderItem={renderPackage}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Choose Photographer</Text>
                <FlatList
                  horizontal
                  data={photographers}
                  keyExtractor={item => item._id}
                  renderItem={renderPhotographer}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{bookingType === 'Photography' ? '3.' : ''} Available Time Slots</Text>
            <View style={styles.slotsGrid}>
              {availableSlots.length > 0 ? availableSlots.map(slot => (
                <TouchableOpacity 
                  key={slot._id} 
                  style={[styles.slotItem, selectedSlotId === slot._id && styles.activeSlot]} 
                  onPress={() => setSelectedSlotId(slot._id)}
                >
                  <Text style={[styles.slotTime, selectedSlotId === slot._id && styles.activeText]}>{slot.startTime}</Text>
                  {bookingType === 'Photography' && !selectedPhotographer && (
                    <Text style={[styles.slotSub, selectedSlotId === slot._id && styles.activeText]}>{slot.photographer?.name}</Text>
                  )}
                </TouchableOpacity>
              )) : (
                <Text style={styles.emptyText}>No available slots found for this date.</Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtn, (!selectedSlotId || loading) && styles.disabledBtn]} 
            onPress={handleConfirmBooking}
            disabled={!selectedSlotId || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Confirm {bookingType} Booking</Text>}
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  heroImage: { width: '100%', height: 220 },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  typeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  typeText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  packageCard: { width: 160, backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginRight: 15, borderWidth: 2, borderColor: '#EEE' },
  activePackage: { borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
  packageName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  packageDetail: { fontSize: 12, color: '#666', marginBottom: 8 },
  packagePrice: { fontSize: 15, color: '#4CAF50', fontWeight: 'bold' },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#F0F0F0', marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
  activeChip: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  chipText: { color: '#666', fontWeight: '600' },
  activeChipText: { color: '#FFF' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotItem: { width: '30%', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, margin: '1.5%', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  activeSlot: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  slotTime: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  slotSub: { fontSize: 10, color: '#999', marginTop: 4 },
  activeText: { color: '#FFF' },
  confirmBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 4 },
  confirmBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#CCC', elevation: 0 },
  emptyText: { color: '#999', fontStyle: 'italic', paddingLeft: 5 },
});
