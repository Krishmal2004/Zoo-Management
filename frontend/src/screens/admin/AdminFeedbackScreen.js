<<<<<<< HEAD
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { getFeedback, updateFeedbackStatus, deleteFeedback } from '../../api/feedback.api';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

const STATUSES = ['all', 'pending', 'reviewed', 'resolved'];
const CATEGORIES = ['all', 'general', 'exhibit', 'staff', 'facility', 'food', 'other'];
const STATUS_COLORS = { pending: '#f59e0b', reviewed: '#3b82f6', resolved: '#22c55e' };

function StarRow({ rating }) {
  return (
    <Text style={styles.stars}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </Text>
  );
}

export default function AdminFeedbackScreen({ navigation }) {
  const route = useRoute();
  const hero = getAdminModuleHeroByRouteName(route.name);
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Status update modal
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draftStatus, setDraftStatus] = useState('pending');
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const r = await getFeedback(params);
      setItems(r.data || []);
    } catch { setError('Failed to load feedback.'); }
    finally { setLoading(false); }
  }, [statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openStatusModal = (item) => {
    setSelected(item);
    setDraftStatus(item.status || 'pending');
    setDraftNote(item.adminNote || '');
    setFormError('');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!draftStatus) return;
    setSaving(true); setFormError('');
    try {
      await updateFeedbackStatus(selected._id, draftStatus, draftNote);
      setShowModal(false);
      load();
    } catch (e) { setFormError(e?.response?.data?.message || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Feedback', `Delete feedback from "${item.visitorName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteFeedback(item._id); setItems(p => p.filter(x => x._id !== item._id)); }
        catch { setError('Failed to delete.'); }
      }},
    ]);
  };

  return (
    <AccountDrawerLayout headerTitle="Admin" drawerMenuItems={drawerMenuItems}>
      <StatusBar style="dark" />
      {hero && (<View style={styles.heroCard}><Text style={styles.heroTitle}>{hero.title}</Text><Text style={styles.heroSub}>{hero.subtitle}</Text></View>)}

      {/* Filters */}
      <Text style={styles.filterLabel}>Filter by Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={styles.chipRow}>
          {STATUSES.map((s) => (
            <Pressable key={s} onPress={() => setStatusFilter(s)}
              style={[styles.chip, statusFilter === s && styles.chipActive]}>
              <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.filterLabel}>Filter by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCategoryFilter(c)}
              style={[styles.chip, categoryFilter === c && styles.chipActive]}>
              <Text style={[styles.chipText, categoryFilter === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {error ? <Text style={styles.err}>{error}</Text> : null}
      {loading ? <Text style={styles.hint}>Loading…</Text> : null}

      {items.map((item) => (
        <View key={item._id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.visitorName}</Text>
              <Text style={styles.cardEmail}>{item.email}</Text>
              <StarRow rating={item.rating} />
            </View>
            <View style={[styles.statusPill, { backgroundColor: (STATUS_COLORS[item.status] || '#9ca3af') + '22', borderColor: STATUS_COLORS[item.status] || '#9ca3af' }]}>
              <Text style={[styles.statusPillText, { color: STATUS_COLORS[item.status] || '#9ca3af' }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.catRow}>
            <Text style={styles.catBadge}>{item.category}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
          {item.adminNote ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Admin note:</Text>
              <Text style={styles.noteText}>{item.adminNote}</Text>
            </View>
          ) : null}
          <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => openStatusModal(item)} style={styles.actBtn}>
              <Text style={styles.actEdit}>✏ Update Status</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item)} style={styles.actBtn}>
              <Text style={styles.actDel}>🗑 Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {!loading && items.length === 0 && <Text style={styles.hint}>No feedback entries found.</Text>}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>Update Status</Text>
          {selected && (
            <Text style={styles.modalSub}>Feedback from: {selected.visitorName}</Text>
          )}
          {formError ? <Text style={styles.err}>{formError}</Text> : null}
          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipRow}>
            {['pending', 'reviewed', 'resolved'].map((s) => (
              <Pressable key={s} onPress={() => setDraftStatus(s)}
                style={[styles.chip, draftStatus === s && styles.chipActive]}>
                <Text style={[styles.chipText, draftStatus === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <TextField label="Admin Note (optional)" value={draftNote} onChangeText={setDraftNote} multiline />
          <PrimaryButton title={saving ? 'Saving…' : 'Save'} onPress={handleUpdateStatus} loading={saving} style={styles.saveBtn} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={() => setShowModal(false)} />
        </ScrollView>
      </Modal>
    </AccountDrawerLayout>
=======
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';
import * as feedbackApi from '../../api/feedback.api';
import { getApiBaseUrl } from '../../api/getApiBaseUrl';

const TYPES = [
  'All',
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

export default function AdminFeedbackScreen() {
  const [activeTab, setActiveTab] = useState('Feedback');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

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

  // Handle Filtering and Searching
  useEffect(() => {
    let result = data;

    // Filter by type (only for Feedback and Inquiry)
    if (filterType !== 'All' && activeTab !== 'Review') {
      result = result.filter(item => item.type === filterType);
    }

    // Search by User Name or Subject
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.userId?.fullName?.toLowerCase().includes(query) ||
        item.subject?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query)
      );
    }

    setFilteredData(result);
  }, [data, searchQuery, filterType, activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      if (activeTab === 'Feedback') {
        await feedbackApi.replyToFeedback(selectedItem._id, replyText);
      } else if (activeTab === 'Inquiry') {
        await feedbackApi.replyToInquiry(selectedItem._id, replyText);
      } else {
        await feedbackApi.replyToReview(selectedItem._id, replyText);
      }
      Alert.alert('Success', 'Reply updated successfully');
      setShowReplyModal(false);
      setReplyText('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteReply = (item) => {
    Alert.alert(
      'Delete Response',
      'Are you sure you want to remove this response?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'Feedback') {
                await feedbackApi.replyToFeedback(item._id, '');
              } else if (activeTab === 'Inquiry') {
                await feedbackApi.replyToInquiry(item._id, '');
              } else {
                await feedbackApi.replyToReview(item._id, '');
              }
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete response');
            }
          },
        },
      ]
    );
  };

  const renderReplySection = (reply) => (
    reply ? (
      <View style={styles.replyBox}>
        <Text style={styles.replyLabel}>Our Response:</Text>
        <Text style={styles.replyText}>{reply}</Text>
      </View>
    ) : null
  );

  const renderActions = (item) => (
    <View style={styles.actionContainer}>
      {item.adminReply ? (
        <>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editActionBtn]} 
            onPress={() => { setSelectedItem(item); setReplyText(item.adminReply); setShowReplyModal(true); }}
          >
            <Text style={styles.editActionBtnText}>Edit Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteActionBtn]} 
            onPress={() => handleDeleteReply(item)}
          >
            <Text style={styles.deleteActionBtnText}>Delete Reply</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity 
          style={styles.replyBtn} 
          onPress={() => { setSelectedItem(item); setReplyText(''); setShowReplyModal(true); }}
        >
          <Text style={styles.replyBtnText}>Reply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFeedback = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.itemType}>{item.type}</Text>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message}>{item.message}</Text>
      {renderReplySection(item.adminReply)}
      {renderActions(item)}
    </View>
  );

  const renderInquiry = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.userId?.fullName || 'Unknown User'}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.inquiryMeta}>
        <Text style={styles.itemType}>{item.type}</Text>
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
      {renderReplySection(item.adminReply)}
      {renderActions(item)}
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
      {renderReplySection(item.adminReply)}
      {renderActions(item)}
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
            onPress={() => {
              setActiveTab(tab);
              setFilterType('All'); // Reset filter on tab change
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {activeTab !== 'Review' && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TYPES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, filterType === item && styles.activeFilterChip]}
                onPress={() => setFilterType(item)}
              >
                <Text style={[styles.filterChipText, filterType === item && styles.activeFilterChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accentGreen]} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          )
        }
      />

      <Modal
        visible={showReplyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to {activeTab}</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your response here..."
              multiline
              numberOfLines={4}
              value={replyText}
              onChangeText={setReplyText}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowReplyModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.submitBtn]} 
                onPress={handleReplySubmit}
                disabled={replyLoading}
              >
                <Text style={styles.submitBtnText}>
                  {replyLoading ? 'Sending...' : 'Send Reply'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
>>>>>>> main
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  heroCard: { backgroundColor: theme.colors.welcomeBackground, borderRadius: theme.radii.md, borderLeftWidth: 4, borderLeftColor: theme.colors.accentGreen, borderWidth: 1, borderColor: theme.colors.sage, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  heroTitle: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.colors.linkGreen },
  heroSub: { marginTop: 4, fontSize: theme.fontSize.sm, color: theme.colors.accentGreen },
  filterLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6 },
  err: { color: theme.colors.error || '#d9534f', marginVertical: 8, fontSize: theme.fontSize.sm },
  hint: { color: theme.colors.primaryText, opacity: 0.6, marginVertical: 8, fontSize: theme.fontSize.sm, fontStyle: 'italic' },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, borderLeftWidth: 4, borderLeftColor: '#3b82f6', padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText },
  cardEmail: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.65, marginTop: 2 },
  stars: { fontSize: 14, color: '#f59e0b', marginTop: 4 },
  statusPill: { borderRadius: theme.radii.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  statusPillText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  catRow: { marginTop: 6 },
  catBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '700', color: '#6366f1', backgroundColor: '#ede9fe', borderRadius: theme.radii.pill, paddingHorizontal: 8, paddingVertical: 2 },
  message: { marginTop: 8, fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.85, lineHeight: 20 },
  noteBox: { marginTop: 8, backgroundColor: '#fef9c3', borderRadius: theme.radii.sm, padding: 8 },
  noteLabel: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  noteText: { fontSize: theme.fontSize.sm, color: '#78350f', marginTop: 2 },
  timestamp: { fontSize: 11, color: theme.colors.primaryText, opacity: 0.5, marginTop: 6 },
  actions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actBtn: { paddingVertical: 4 },
  actEdit: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  actDel: { color: theme.colors.error || '#d9534f', fontWeight: '700', fontSize: theme.fontSize.sm },
  modal: { padding: theme.spacing.lg, paddingBottom: 60 },
  modalTitle: { fontSize: theme.fontSize.hero, fontWeight: '800', color: theme.colors.primaryText, marginBottom: 4 },
  modalSub: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.7, marginBottom: theme.spacing.md },
  fieldLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6, marginTop: theme.spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.sm },
  chip: { borderRadius: theme.radii.pill, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: theme.colors.white },
  chipActive: { backgroundColor: theme.colors.sageButton || '#e8f5e9', borderColor: theme.colors.accentGreen },
  chipText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.primaryText },
  chipTextActive: { color: theme.colors.linkGreen },
  saveBtn: { marginBottom: theme.spacing.sm },
=======
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
    fontFamily: theme.fonts.bold,
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
    fontFamily: theme.fonts.bold,
    color: theme.colors.accentGreen,
    fontSize: theme.fontSize.sm,
  },
  date: {
    fontFamily: theme.fonts.regular,
    fontSize: 10,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.body,
    color: theme.colors.black,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.accentGreen,
    borderColor: theme.colors.accentGreen,
  },
  filterChipText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: theme.colors.primaryText,
    opacity: 0.7,
  },
  activeFilterChipText: {
    color: theme.colors.white,
    opacity: 1,
  },
  inquiryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemType: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: theme.colors.primaryText,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  replyBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accentGreen,
    paddingVertical: 10,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  replyBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accentGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  replyBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  editActionBtn: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.accentGreen,
  },
  editActionBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.accentGreen,
    fontSize: 12,
  },
  deleteActionBtn: {
    backgroundColor: '#FFEBEE',
  },
  deleteActionBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.error,
    fontSize: 12,
  },
  replyBox: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#F1F8E9',
    borderRadius: theme.radii.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
  },
  replyLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: theme.colors.accentGreen,
    marginBottom: 4,
  },
  replyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.primaryText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  replyInput: {
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: theme.fontSize.body,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  submitBtn: {
    backgroundColor: theme.colors.accentGreen,
  },
  cancelBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryText,
  },
  submitBtnText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusNew: { backgroundColor: '#E3F2FD' },
  statusResolved: { backgroundColor: '#E8F5E9' },
  statusText: { fontFamily: theme.fonts.bold, fontSize: 9 },
  subject: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    marginBottom: 4,
  },
  message: {
    fontFamily: theme.fonts.regular,
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
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.5,
  },
>>>>>>> main
});
