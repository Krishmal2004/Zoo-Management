import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import apiClient from '../../api/client';

export default function PhotographyBookingManagementScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/photography-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiClient.patch(`/photography-bookings/${id}`, { status: newStatus });
      Alert.alert('Success', `Booking marked as ${newStatus}.`);
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status.');
    }
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.visitorName}>{item.visitorName}</Text>
        <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.detail}>📅 {new Date(item.date).toLocaleDateString()} at {item.time}</Text>
      <Text style={styles.detail}>🦁 Animal: {item.animal?.name || 'Unknown'}</Text>
      <Text style={styles.detail}>📸 Photographer: {item.photographer?.name || 'Assigned'}</Text>
      <Text style={styles.detail}>📞 Contact: {item.contactInfo}</Text>

      {item.status === 'booked' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.approveBtn} 
            onPress={() => handleStatusUpdate(item._id, 'completed')}
          >
            <Text style={styles.approveText}>Mark Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rejectBtn} 
            onPress={() => handleStatusUpdate(item._id, 'cancelled')}
          >
            <Text style={styles.rejectText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Bookings</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchBookings}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#FFF' 
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  refreshBtn: { padding: 5 },
  refreshText: { color: '#2196F3', fontWeight: '600' },
  list: { padding: 15 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  visitorName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusbooked: { backgroundColor: '#E3F2FD' },
  statuscompleted: { backgroundColor: '#E8F5E9' },
  statuscancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#555' },
  detail: { fontSize: 14, color: '#666', marginBottom: 4 },
  actions: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  approveBtn: { flex: 1, backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  approveText: { color: '#2E7D32', fontWeight: 'bold' },
  rejectBtn: { flex: 1, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectText: { color: '#C62828', fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
});
