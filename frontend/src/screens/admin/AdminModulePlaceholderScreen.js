import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { getAdminDrawerMenuItems } from './adminNavigation';

export default function AdminModulePlaceholderScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <View style={styles.empty} />
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
  },
});
