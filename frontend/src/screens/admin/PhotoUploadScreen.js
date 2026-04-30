import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../api/client';

export default function PhotoUploadScreen({ route, navigation }) {
  const [bookingId, setBookingId] = useState(route.params?.bookingId || '');
  const [visitorName, setVisitorName] = useState(route.params?.visitorName || '');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      fetchBookings();
    }
  }, [bookingId]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await apiClient.get('/photography-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleUpload = async () => {
    if (!bookingId) {
      Alert.alert('Error', 'Please select a booking first.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please select at least one image.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('booking', bookingId);
      formData.append('caption', caption);

      images.forEach((image, index) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('photos', {
          uri: image.uri,
          name: `photo_${index}.${fileType}`,
          type: `image/${fileType}`,
        });
      });

      const response = await apiClient.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Photos uploaded successfully!');
        setImages([]);
        setCaption('');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photos. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.bookingCard, bookingId === item._id && styles.selectedBooking]}
      onPress={() => {
        setBookingId(item._id);
        setVisitorName(item.visitorName);
      }}
    >
      <Text style={styles.bookingName}>{item.visitorName}</Text>
      <Text style={styles.bookingDate}>{new Date(item.date).toLocaleDateString()} at {item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Photographer Tools</Text>
          <Text style={styles.subtitle}>Select a booking and upload photos</Text>
        </View>

        {!route.params?.bookingId && (
          <View style={styles.section}>
            <Text style={styles.label}>1. Select Booking</Text>
            {loadingBookings ? (
              <ActivityIndicator color="#2196F3" />
            ) : (
              <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookingList}
                ListEmptyComponent={<Text style={styles.emptyText}>No recent bookings found.</Text>}
              />
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>2. Select Photos</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={pickImages}>
            <Text style={styles.pickerButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <View style={styles.previewContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeIcon} 
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>3. Details & Upload</Text>
          <TextInput
            style={styles.input}
            placeholder="Photo caption (e.g., Feeding the Giraffes)"
            value={caption}
            onChangeText={setCaption}
          />
          <TouchableOpacity 
            style={[styles.uploadButton, (uploading || !bookingId || images.length === 0) && styles.disabledButton]} 
            onPress={handleUpload}
            disabled={uploading || !bookingId || images.length === 0}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.uploadButtonText}>
                {bookingId ? `Upload to ${visitorName}` : 'Select Booking First'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  bookingList: {
    paddingVertical: 5,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    minWidth: 150,
  },
  selectedBooking: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  bookingName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  bookingDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pickerButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  pickerButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
});
