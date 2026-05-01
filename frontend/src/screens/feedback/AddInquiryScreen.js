import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';

const INQUIRY_TYPES = [
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

export default function AddInquiryScreen({ navigation }) {
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!type || !subject || !message) {
      Alert.alert('Missing Fields', 'Please fill in all fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('subject', subject);
      formData.append('message', message);
      
      if (image) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: image.uri,
          name: `inquiry-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      await feedbackApi.createInquiry(formData);
      Alert.alert('Success', 'Your inquiry has been submitted. We will get back to you soon!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.form}>
        <Text style={styles.label}>Inquiry Type</Text>
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={[styles.pickerValue, !type && styles.pickerPlaceholder]}>
            {type || 'Select inquiry type'}
          </Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>

        <TextField
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="What is your question about?"
        />

        <TextField
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Explain your inquiry in detail..."
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Attachment (Optional)</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageEmoji}>📸</Text>
              <Text style={styles.imageText}>Tap to add an image</Text>
            </View>
          )}
        </TouchableOpacity>
        {image && (
          <TouchableOpacity onPress={() => setImage(null)} style={styles.removeBtn}>
            <Text style={styles.removeText}>Remove image</Text>
          </TouchableOpacity>
        )}

        <PrimaryButton
          title="Submit Inquiry"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      <Modal
        visible={showTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Inquiry Type</Text>
            {INQUIRY_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.modalOption}
                onPress={() => {
                  setType(t);
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
  },
  pickerTrigger: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pickerValue: {
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  pickerPlaceholder: {
    color: '#9E9E9E',
  },
  pickerChevron: {
    fontSize: 18,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  imagePicker: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    height: 180,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: { fontSize: 32, marginBottom: 8 },
  imageText: { color: '#9E9E9E', fontSize: theme.fontSize.sm },
  previewImage: { width: '100%', height: '100%' },
  removeBtn: {
    alignSelf: 'center',
    padding: 8,
    marginBottom: theme.spacing.md,
  },
  removeText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: 12,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    width: '100%',
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
});
