import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminAnimalInformationEducationScreen from '../screens/admin/AdminAnimalInformationEducationScreen';
import AdminTicketsShowScreen from '../screens/admin/AdminTicketsShowScreen';
import AdminEventManagementScreen from '../screens/admin/AdminEventManagementScreen';
import AdminEncounterPhotographyScreen from '../screens/admin/AdminEncounterPhotographyScreen';
import AdminOnlineStoreScreen from '../screens/admin/AdminOnlineStoreScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();
const noHeader = { headerShown: false };

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={noHeader} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={noHeader} />
      <Stack.Screen name="AdminEntryTicketsShowBooking" component={AdminTicketsShowScreen} options={noHeader} />
      <Stack.Screen name="AdminEventManagement" component={AdminEventManagementScreen} options={noHeader} />
      <Stack.Screen name="AdminAnimalEncounterPhotography" component={AdminEncounterPhotographyScreen} options={noHeader} />
      <Stack.Screen name="AdminAnimalInformationEducation" component={AdminAnimalInformationEducationScreen} options={noHeader} />
      <Stack.Screen name="AdminOnlineStore" component={AdminOnlineStoreScreen} options={noHeader} />
      <Stack.Screen name="AdminFeedbackInquiryReview" component={AdminFeedbackScreen} options={noHeader} />
    </Stack.Navigator>
  );
}
