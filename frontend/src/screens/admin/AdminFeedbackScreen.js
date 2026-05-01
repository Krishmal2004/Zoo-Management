import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import { getApiBaseUrl } from '../../api/getApiBaseUrl';

export default function AdminFeedbackScreen() {
  const [activeTab, setActiveTab] = useState('Feedback');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'Feedback') {
        response = await feedbackApi.getAllFeedbacks();
        setData(response.data.feedbacks);
      } else if (activeTab === 'Inquiry') {
        response = await feedbackApi.getAllInquiries();
        setData(response.data.inquiries);
      } else {
        response = await feedbackApi.getAllReviews();
        setData(response.data.reviews);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const renderFeedback = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.type}>{item.type}</Text>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  const renderInquiry = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.inquiryMeta}>
        <Text style={styles.type}>{item.type}</Text>
        <View style={[styles.statusBadge, item.status === 'RESOLVED' ? styles.statusResolved : styles.statusNew]}>
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

  const renderReview = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.stars}>{'⭐'.repeat(item.rating)}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    if (activeTab === 'Feedback') return renderFeedback(item);
    if (activeTab === 'Inquiry') return renderInquiry(item);
    return renderReview(item);
  };

  return (
    <ScreenContainer scroll={false} backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.tabBar}>
        {['Feedback', 'Inquiry', 'Review'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accentGreen]} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()}s found</Text>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: 4,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radii.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.accentGreen,
  },
  tabText: {
    fontWeight: '700',
    color: theme.colors.primaryText,
    opacity: 0.6,
  },
  activeTabText: {
    color: theme.colors.white,
    opacity: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
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
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontWeight: '700',
    color: theme.colors.accentGreen,
    fontSize: theme.fontSize.sm,
  },
  date: {
    fontSize: 10,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  inquiryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  type: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryText,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusNew: { backgroundColor: '#E3F2FD' },
  statusResolved: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 9, fontWeight: '700' },
  subject: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: 4,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.8,
    lineHeight: 18,
  },
  stars: { fontSize: 14, marginBottom: 4 },
  image: {
    width: '100%',
    height: 150,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
});
