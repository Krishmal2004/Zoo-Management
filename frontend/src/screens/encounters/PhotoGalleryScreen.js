import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import apiClient from '../../api/client';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

export default function PhotoGalleryScreen({ route, navigation }) {
  const { bookingId, animalName } = route.params || {};
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [bookingId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const endpoint = bookingId 
        ? `/photos/booking/${bookingId}` 
        : '/photos';
      
      const response = await apiClient.get(endpoint);
      if (response.data.success) {
        setPhotos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      Alert.alert('Error', 'Failed to load photos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (photo) => {
    // Simple mock implementation as requested
    Alert.alert('Download', 'This would download the image to your gallery.');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.imageContainer}
      onPress={() => Alert.alert('Photo', item.caption || 'Zoo Encounter')}
    >
      <Image source={{ uri: `http://192.168.1.203:5000${item.imageUrl}` }} style={styles.image} />
      <TouchableOpacity 
        style={styles.downloadIcon} 
        onPress={() => handleDownload(item)}
      >
        <Text style={styles.downloadText}>📥</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{animalName ? `${animalName} Photos` : 'My Photo Gallery'}</Text>
        <Text style={styles.subtitle}>Your captured moments at the zoo</Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No photos available yet.</Text>
          <Text style={styles.emptySubtext}>They will appear here once the photographer uploads them.</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 2,
  },
  imageContainer: {
    width: IMAGE_SIZE - 4,
    height: IMAGE_SIZE - 4,
    margin: 2,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  downloadIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
