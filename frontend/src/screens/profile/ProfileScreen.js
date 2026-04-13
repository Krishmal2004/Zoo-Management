import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AccountDrawerLayout, { useAccountDrawerActions } from '../../components/profile/AccountDrawerLayout';
import ModuleCard from '../../components/ui/ModuleCard';
import { FEATURE_MODULES } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

const drawerTitleStyle = {
  fontSize: theme.fontSize.lg,
  lineHeight: Math.round(theme.fontSize.lg * 1.35),
};

function ProfileExploreBody({ navigation, firstName, moduleRows }) {
  const actions = useAccountDrawerActions();

  return (
    <>
      <View style={styles.adventureHeading}>
        <Text style={styles.adventureLeaf} accessible={false} importantForAccessibility="no">
          🌿
        </Text>
        <Text style={styles.adventureTitle}>
          {firstName}, Start your adventure here
        </Text>
      </View>

      {actions ? (
        <View style={styles.profileAccountActions}>
          <Pressable
            onPress={actions.openEditInDrawer}
            style={styles.profileAccountBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit account details"
          >
            <Text style={styles.profileAccountBtnText}>Edit account</Text>
          </Pressable>
          <Pressable
            onPress={actions.openPasswordInDrawer}
            style={styles.profileAccountBtn}
            accessibilityRole="button"
            accessibilityLabel="Change password"
          >
            <Text style={styles.profileAccountBtnText}>Change password</Text>
          </Pressable>
        </View>
      ) : null}

      <>
        {moduleRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.moduleRow}>
            {row.map((m) => (
              <View key={m.route} style={styles.moduleCell}>
                <ModuleCard
                  variant="grid"
                  title={m.title}
                  description={m.description}
                  emoji={m.emoji}
                  image={m.image}
                  onPress={() => navigation.navigate(m.route)}
                />
              </View>
            ))}
          </View>
        ))}
      </>
    </>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();

  const firstName = useMemo(() => {
    const parts = user?.fullName?.trim().split(/\s+/).filter(Boolean);
    return parts?.[0] || 'there';
  }, [user?.fullName]);

  const moduleRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < FEATURE_MODULES.length; i += 2) {
      rows.push(FEATURE_MODULES.slice(i, i + 2));
    }
    return rows;
  }, []);

  const drawerMenuItems = useMemo(
    () => [
      {
        key: 'my-profile',
        label: 'My Profile',
        accessibilityLabel: 'My profile: Explore home',
        titleStyle: drawerTitleStyle,
        onPress: () => navigation.navigate('Profile'),
      },
    ],
    [navigation]
  );

  return (
    <AccountDrawerLayout
      headerTitle="Explore"
      drawerMenuItems={drawerMenuItems}
      accountActionsPlacement="main"
      accountActionsInline
    >
      <ProfileExploreBody navigation={navigation} firstName={firstName} moduleRows={moduleRows} />
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  adventureHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  adventureLeaf: {
    fontSize: 28,
    lineHeight: 32,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  adventureTitle: {
    flex: 1,
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    lineHeight: theme.fontSize.title * 1.25,
  },
  profileAccountActions: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  profileAccountBtn: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accentGreen,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  profileAccountBtnText: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    letterSpacing: 0.2,
  },
  moduleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  moduleCell: {
    flex: 1,
    minWidth: 0,
  },
});
