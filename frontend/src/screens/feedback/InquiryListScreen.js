import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import { useAuth } from '../../hooks/useAuth';
import { getApiBaseUrl } from '../../api/getApiBaseUrl';

export default function InquiryListScreen({ navigation }) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await feedbackApi.getMyInquiries();
      setInquiries(response.data.inquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await feedbackApi.getMyInquiries();
      setInquiries(response.data.inquiries);
    } catch (error) {
      console.error('Error refreshing inquiries:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, [fetchInquiries])
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESOLVED':
        return styles.statusResolved;
      case 'IN PROGRESS':
        return styles.statusProgress;
      default:
        return styles.statusNew;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      
      {item.imageUrl && (
        <Image
          source={{ uri: `${getApiBaseUrl().replace('/api', '')}${item.imageUrl}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );

  return (
    <ScreenContainer scroll={false} backgroundColor={theme.colors.backgroundAlt}>
      <FlatList
        data={inquiries}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accentGreen]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Inquiries</Text>
            <PrimaryButton
              title="Add New Inquiry"
              onPress={() => navigation.navigate('AddInquiry')}
              style={styles.addButton}
            />
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>❓</Text>
              <Text style={styles.emptyText}>No inquiries submitted yet</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  addButton: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  type: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusNew: { backgroundColor: '#E3F2FD' },
  statusProgress: { backgroundColor: '#FFF3E0' },
  statusResolved: { backgroundColor: '#E8F5E9' },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  subject: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.backgroundAlt,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
});
