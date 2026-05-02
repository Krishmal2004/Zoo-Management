import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/events.api';
import { getAdminDrawerMenuItems, getAdminModuleHeroByRouteName } from './adminNavigation';

const CATEGORIES = ['conservation', 'education', 'entertainment', 'feeding', 'seasonal', 'other'];

const BLANK = { title: '', description: '', eventDate: '', location: '', capacity: '', price: '', imageUrl: '', category: 'other', isActive: true };

function ChipRow({ options, selected, onSelect }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => onSelect(o)} style={[styles.chip, selected === o && styles.chipActive]}>
          <Text style={[styles.chipText, selected === o && styles.chipTextActive]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function AdminEventManagementScreen({ navigation }) {
  const route = useRoute();
  const hero = getAdminModuleHeroByRouteName(route.name);
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const r = await getEvents(); setItems(r.data || []); }
    catch { setError('Failed to load events.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter(i => i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const setF = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const openNew = () => { setEditing(null); setDraft(BLANK); setFormError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setDraft({
      title: item.title || '', description: item.description || '',
      eventDate: item.eventDate ? item.eventDate.split('T')[0] : '',
      location: item.location || '', capacity: String(item.capacity ?? ''),
      price: String(item.price ?? ''), imageUrl: item.imageUrl || '',
      category: item.category || 'other', isActive: item.isActive ?? true,
    });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.description.trim() || !draft.eventDate || !draft.location.trim() || !draft.capacity || !draft.price) {
      setFormError('Title, description, date, location, capacity and price are required.'); return;
    }
    setSaving(true); setFormError('');
    const payload = { ...draft, capacity: parseInt(draft.capacity), price: parseFloat(draft.price) };
    try {
      if (editing) { await updateEvent(editing._id, payload); }
      else { await createEvent(payload); }
      setShowModal(false); load();
    } catch (e) { setFormError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Event', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteEvent(item._id); setItems(p => p.filter(x => x._id !== item._id)); }
        catch { setError('Failed to delete.'); }
      }},
    ]);
  };

  return (
    <AccountDrawerLayout headerTitle="Admin" drawerMenuItems={drawerMenuItems}>
      <StatusBar style="dark" />
      {hero && (<View style={styles.heroCard}><Text style={styles.heroTitle}>{hero.title}</Text><Text style={styles.heroSub}>{hero.subtitle}</Text></View>)}
      <PrimaryButton title="＋ Add Event" onPress={openNew} style={styles.addBtn} />
      <TextField label="Search" value={search} onChangeText={setSearch} placeholder="Title or location…" />
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {loading ? <Text style={styles.hint}>Loading…</Text> : null}
      {filtered.map((item) => (
        <View key={item._id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.title}</Text>
              <Text style={styles.cardMeta}>📅 {new Date(item.eventDate).toLocaleDateString()} · 📍 {item.location}</Text>
              <Text style={styles.cardMeta}>LKR {item.price} · Cap: {item.capacity} · {item.category}</Text>
            </View>
            <View style={[styles.statusBadge, !item.isActive && styles.statusBadgeOff]}>
              <Text style={[styles.statusText, !item.isActive && styles.statusTextOff]}>{item.isActive ? 'Active' : 'Off'}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => openEdit(item)} style={styles.actBtn}><Text style={styles.actEdit}>✏ Edit</Text></Pressable>
            <Pressable onPress={() => handleDelete(item)} style={styles.actBtn}><Text style={styles.actDel}>🗑 Delete</Text></Pressable>
          </View>
        </View>
      ))}
      {!loading && filtered.length === 0 && <Text style={styles.hint}>No events found.</Text>}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{editing ? 'Edit Event' : 'Add Event'}</Text>
          {formError ? <Text style={styles.err}>{formError}</Text> : null}
          <TextField label="Title *" value={draft.title} onChangeText={(v) => setF('title', v)} />
          <TextField label="Description *" value={draft.description} onChangeText={(v) => setF('description', v)} multiline />
          <TextField label="Event Date (YYYY-MM-DD) *" value={draft.eventDate} onChangeText={(v) => setF('eventDate', v)} />
          <TextField label="Location *" value={draft.location} onChangeText={(v) => setF('location', v)} />
          <TextField label="Capacity *" value={draft.capacity} onChangeText={(v) => setF('capacity', v)} keyboardType="numeric" />
          <TextField label="Price (LKR) *" value={draft.price} onChangeText={(v) => setF('price', v)} keyboardType="numeric" />
          <TextField label="Image URL" value={draft.imageUrl} onChangeText={(v) => setF('imageUrl', v)} autoCapitalize="none" />
          <Text style={styles.fieldLabel}>Category</Text>
          <ChipRow options={CATEGORIES} selected={draft.category} onSelect={(v) => setF('category', v)} />
          <Text style={styles.fieldLabel}>Status</Text>
          <ChipRow options={['active', 'inactive']} selected={draft.isActive ? 'active' : 'inactive'} onSelect={(v) => setF('isActive', v === 'active')} />
          <PrimaryButton title={saving ? 'Saving…' : editing ? 'Update' : 'Create'} onPress={handleSave} loading={saving} style={styles.saveBtn} />
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
  addBtn: { marginBottom: theme.spacing.sm },
  err: { color: theme.colors.error || '#d9534f', marginVertical: 8, fontSize: theme.fontSize.sm },
  hint: { color: theme.colors.primaryText, opacity: 0.6, marginVertical: 8, fontSize: theme.fontSize.sm, fontStyle: 'italic' },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, borderLeftWidth: 4, borderLeftColor: '#f59e0b', padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText },
  cardMeta: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.7, marginTop: 2 },
  statusBadge: { backgroundColor: '#e8f5e9', borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  statusBadgeOff: { backgroundColor: '#fce4ec' },
  statusText: { fontSize: 11, fontWeight: '700', color: theme.colors.linkGreen },
  statusTextOff: { color: '#c62828' },
  actions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actBtn: { paddingVertical: 4 },
  actEdit: { color: theme.colors.linkGreen, fontWeight: '700', fontSize: theme.fontSize.sm },
  actDel: { color: theme.colors.error || '#d9534f', fontWeight: '700', fontSize: theme.fontSize.sm },
  modal: { padding: theme.spacing.lg, paddingBottom: 60 },
  modalTitle: { fontSize: theme.fontSize.hero, fontWeight: '800', color: theme.colors.primaryText, marginBottom: theme.spacing.md },
  fieldLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6, marginTop: theme.spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.sm },
  chip: { borderRadius: theme.radii.pill, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: theme.colors.white },
  chipActive: { backgroundColor: theme.colors.sageButton || '#e8f5e9', borderColor: theme.colors.accentGreen },
  chipText: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.primaryText },
  chipTextActive: { color: theme.colors.linkGreen },
  saveBtn: { marginBottom: theme.spacing.sm },
});
