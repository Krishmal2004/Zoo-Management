import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
