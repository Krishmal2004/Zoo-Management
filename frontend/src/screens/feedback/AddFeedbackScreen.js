import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';

const FEEDBACK_TYPES = [
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

export default function AddFeedbackScreen({ navigation }) {
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const handleSubmit = async () => {
    if (!type || !subject || !message) {
      Alert.alert('Missing Fields', 'Please fill in all fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      await feedbackApi.createFeedback({ type, subject, message });
      Alert.alert('Success', 'Your feedback has been submitted. Thank you!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.form}>
        <Text style={styles.label}>Feedback Type</Text>
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={[styles.pickerValue, !type && styles.pickerPlaceholder]}>
            {type || 'Select feedback type'}
          </Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>

        <TextField
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="What is this about?"
        />

        <TextField
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Tell us more..."
          multiline
          numberOfLines={6}
        />

        <PrimaryButton
          title="Submit Feedback"
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
            <Text style={styles.modalTitle}>Select Feedback Type</Text>
            {FEEDBACK_TYPES.map((t) => (
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
