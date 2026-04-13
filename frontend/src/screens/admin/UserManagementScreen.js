import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import PrimaryButton from '../../components/ui/PrimaryButton';
import TextField from '../../components/ui/TextField';
import { theme } from '../../constants/theme';
import { deleteUser, getUsers, updateUser } from '../../api/admin.api';
import { useAuth } from '../../hooks/useAuth';
import { validateProfileFields } from '../../utils/validation';

const drawerTitleStyle = {
  fontSize: theme.fontSize.lg,
  lineHeight: Math.round(theme.fontSize.lg * 1.35),
};

export default function UserManagementScreen({ navigation }) {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [draftFullName, setDraftFullName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [draftRole, setDraftRole] = useState('visitor');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data?.data?.users ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const drawerMenuItems = useMemo(
    () => [
      {
        key: 'explore-home',
        label: 'My Profile',
        accessibilityLabel: 'My profile: go to workspace home',
        titleStyle: drawerTitleStyle,
        onPress: () => navigation.navigate('AdminHome'),
      },
      {
        key: 'user-management',
        label: 'User Management',
        accessibilityLabel: 'User management: view and edit accounts',
        titleStyle: drawerTitleStyle,
        onPress: () => navigation.navigate('UserManagement'),
      },
    ],
    [navigation]
  );

  const selectedUser = useMemo(
    () => users.find((u) => String(u._id) === String(selectedId)) ?? null,
    [users, selectedId]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const matches = (s) => (s ?? '').toString().toLowerCase().includes(q);
      return (
        matches(u.fullName) ||
        matches(u.email) ||
        matches(u.phone) ||
        matches(u.role) ||
        matches(String(u._id))
      );
    });
  }, [users, searchQuery]);

  const startEdit = (u) => {
    setSelectedId(u._id);
    setDraftFullName(u.fullName ?? '');
    setDraftEmail(u.email ?? '');
    setDraftPhone(u.phone ?? '');
    setDraftRole(u.role ?? 'visitor');
    setError('');
  };

  const cancelEdit = () => {
    setSelectedId(null);
    setError('');
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    const errs = validateProfileFields({ fullName: draftFullName, email: draftEmail, phone: draftPhone });
    const msg = Object.values(errs).filter(Boolean).join(' ');
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await updateUser(selectedUser._id, {
        fullName: draftFullName.trim(),
        email: draftEmail.trim(),
        phone: draftPhone.trim(),
        role: draftRole,
      });
      const updated = data?.data?.user;
      setUsers((prev) => prev.map((u) => (u._id === updated?._id ? updated : u)));
      setSelectedId(null);
    } catch (e) {
      const details = e?.response?.data?.errors;
      const valMsg = Array.isArray(details) ? details.map((x) => x.msg).join(' ') : '';
      setError(valMsg || e?.response?.data?.message || e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (u) => {
    Alert.alert('Delete user', `Delete ${u.fullName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(u._id);
            setUsers((prev) => prev.filter((x) => x._id !== u._id));
            if (selectedId === u._id) setSelectedId(null);
          } catch (e) {
            Alert.alert('Delete failed', e?.response?.data?.message || e?.message || 'Could not delete user');
          }
        },
      },
    ]);
  };

  return (
    <>
      <StatusBar style="dark" />
      <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.sub}>Manage visitor and admin accounts.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.loading}>Loading users...</Text> : null}

      {!loading && selectedUser ? (
        <View style={styles.editCard}>
          <Text style={styles.sectionTitle}>Edit User</Text>
          <TextField label="Full name" value={draftFullName} onChangeText={setDraftFullName} autoCapitalize="words" />
          <TextField label="Email" value={draftEmail} onChangeText={setDraftEmail} keyboardType="email-address" />
          <TextField label="Phone" value={draftPhone} onChangeText={setDraftPhone} keyboardType="phone-pad" />
          <Text style={styles.roleLabel}>Role</Text>
          <View style={styles.roleRow}>
            {['visitor', 'admin'].map((r) => (
              <Pressable
                key={r}
                onPress={() => setDraftRole(r)}
                style={[styles.roleChip, draftRole === r ? styles.roleChipActive : null]}
              >
                <Text style={[styles.roleChipText, draftRole === r ? styles.roleChipTextActive : null]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton title="Save user" onPress={saveEdit} loading={saving} style={styles.saveBtn} />
          <PrimaryButton title="Cancel" variant="secondary" onPress={cancelEdit} disabled={saving} />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Users</Text>
      {!loading ? (
        <TextField
          label="Search users"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Name, email, phone, or role"
          autoCapitalize="none"
          autoCorrect={false}
        />
      ) : null}

      {!loading && users.length > 0 && filteredUsers.length === 0 ? (
        <Text style={styles.emptySearch}>No users match your search.</Text>
      ) : null}

      {filteredUsers.map((u) => (
        <View key={u._id} style={styles.userCard}>
          <View style={styles.userTop}>
            <Text style={styles.userName}>{u.fullName}</Text>
            <Text style={styles.userRole}>{u.role}</Text>
          </View>
          <Text style={styles.userMeta}>{u.email}</Text>
          <Text style={styles.userMeta}>{u.phone}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => startEdit(u)} style={styles.linkBtn}>
              <Text style={styles.linkText}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => confirmDelete(u)}
              style={styles.linkBtn}
              disabled={String(u._id) === String(me?._id)}
            >
              <Text
                style={[styles.linkText, styles.deleteText, String(u._id) === String(me?._id) ? styles.disabled : null]}
              >
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </AccountDrawerLayout>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.accentGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    color: theme.colors.accentGreen,
    opacity: 0.92,
  },
  error: { color: theme.colors.error, marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm },
  loading: { marginTop: theme.spacing.md, color: theme.colors.primaryText, opacity: 0.8 },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  emptySearch: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  editCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  roleLabel: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  roleChip: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
  },
  roleChipActive: { backgroundColor: theme.colors.sageButton, borderColor: theme.colors.accentGreen },
  roleChipText: { color: theme.colors.primaryText, fontWeight: '700' },
  roleChipTextActive: { color: theme.colors.primaryText },
  saveBtn: { marginBottom: theme.spacing.sm },
  userCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  userTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.colors.primaryText, flex: 1, marginRight: 8 },
  userRole: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8, textTransform: 'capitalize' },
  userMeta: { fontSize: theme.fontSize.sm, color: theme.colors.primaryText, opacity: 0.8, marginTop: 4 },
  actions: { flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.sm },
  linkBtn: { paddingVertical: 4 },
  linkText: { fontSize: theme.fontSize.body, color: theme.colors.linkGreen, fontWeight: '700' },
  deleteText: { color: theme.colors.error },
  disabled: { opacity: 0.5 },
});
