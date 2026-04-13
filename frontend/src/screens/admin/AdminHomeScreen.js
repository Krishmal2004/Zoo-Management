import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

const drawerTitleStyle = {
  fontSize: theme.fontSize.lg,
  lineHeight: Math.round(theme.fontSize.lg * 1.35),
};

function avatarLetter(fullName) {
  const c = fullName?.trim()?.[0];
  return c ? c.toUpperCase() : '?';
}

export default function AdminHomeScreen({ navigation }) {
  const { user } = useAuth();

  const displayName = useMemo(() => user?.fullName?.trim() || 'Admin', [user?.fullName]);

  const drawerMenuItems = useMemo(
    () => [
      {
        key: 'my-profile',
        label: 'My Profile',
        accessibilityLabel: 'My profile: workspace home',
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

  const roleLabel = user?.role === 'admin' ? 'ADMINISTRATOR' : (user?.role || 'USER').toUpperCase();

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <View style={styles.profileBlock}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarFill}>
            <Text style={styles.avatarLetter}>{avatarLetter(user?.fullName)}</Text>
          </View>
        </View>

        <Text style={styles.helloLine}>Hello {displayName}</Text>
        <Text style={styles.emailLine}>{user?.email?.trim() || '—'}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeIcon} accessible={false}>
            🛡
          </Text>
          <Text style={styles.badgeText}>{roleLabel}</Text>
        </View>

        <Pressable
          style={styles.manageCard}
          onPress={() => navigation.navigate('UserManagement')}
          accessibilityRole="button"
          accessibilityLabel="User management"
        >
          <Text style={styles.manageTitle}>User Management</Text>
          <Text style={styles.manageChevron} accessible={false}>
            ›
          </Text>
        </Pressable>
        <Text style={styles.manageHint}>View and edit visitor and admin accounts</Text>
      </View>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  profileBlock: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 3,
    borderWidth: 2,
    borderColor: theme.colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFill: {
    flex: 1,
    width: '100%',
    borderRadius: 52,
    backgroundColor: theme.colors.sageButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  helloLine: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  emailLine: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.68,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radii.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.yellowAlt,
    backgroundColor: theme.colors.white,
    gap: 8,
  },
  badgeIcon: {
    fontSize: 16,
    color: theme.colors.linkGreen,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.linkGreen,
  },
  manageCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  manageTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  manageChevron: {
    fontSize: 22,
    color: theme.colors.accentGreen,
    fontWeight: '300',
  },
  manageHint: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.72,
    textAlign: 'center',
  },
});
