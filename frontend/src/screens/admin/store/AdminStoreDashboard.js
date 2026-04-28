import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { Ionicons } from '@expo/vector-icons';
import { getAllOrders } from '../../../api/order.api';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminStoreDashboard({ navigation }) {
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchPendingCount();
    }, [])
  );

  const fetchPendingCount = async () => {
    try {
      const response = await getAllOrders();
      const orders = response.data.data || [];
      const pending = orders.filter(o => o.orderStatus === 'pending').length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Error fetching pending count', error);
    }
  };

  const menuItems = [
    { title: 'Manage Products', icon: 'cube', screen: 'ManageProducts', color: '#1B5E20' },
    { title: 'Manage Orders', icon: 'receipt', screen: 'ManageOrders', color: '#1B5E20', showBadge: true },
  ];

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Store Management</Text>
        <Text style={styles.subtitle}>Admin Control Panel</Text>

        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={32} color="#FFF" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>

              {item.showBadge && pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Dosis_700Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    fontFamily: 'Dosis_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Dosis_700Bold',
    color: '#0D2D1D',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Dosis_700Bold',
  },
});
