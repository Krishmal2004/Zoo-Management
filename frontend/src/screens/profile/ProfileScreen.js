import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <Text style={styles.title}>Your profile</Text>
      <View style={styles.card}>
        <Row label="Name" value={user?.fullName} />
        <Row label="Email" value={user?.email} />
        <Row label="Phone" value={user?.phone} />
        <Row label="Role" value={user?.role} />
      </View>
      <PrimaryButton title="Log out" variant="secondary" onPress={handleLogout} style={styles.btn} />
    </ScreenContainer>
  );
}

function Row({ label, value }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value ?? '—'}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.primaryText },
  value: { marginTop: 4, fontSize: theme.fontSize.body, color: theme.colors.black },
});

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  btn: { marginTop: theme.spacing.sm },
});
