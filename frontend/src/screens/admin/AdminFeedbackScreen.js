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
  );
}

const styles = StyleSheet.create({
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
});
