import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminModulePlaceholderScreen from '../screens/admin/AdminModulePlaceholderScreen';
import PhotoUploadScreen from '../screens/admin/PhotoUploadScreen';
import EncounterPhotographyDashboard from '../screens/admin/EncounterPhotographyDashboard';
import PhotographerManagementScreen from '../screens/admin/PhotographerManagementScreen';
import TimeSlotManagementScreen from '../screens/admin/TimeSlotManagementScreen';
import PhotographyBookingManagementScreen from '../screens/admin/PhotographyBookingManagementScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

const adminModulePlaceholderOptions = { headerShown: false };

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminHome" screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
      
      {/* Animal Encounter & Photography Module */}
      <Stack.Screen
        name="AdminAnimalEncounterPhotography"
        component={EncounterPhotographyDashboard}
        options={{ title: 'Encounter & Photography' }}
      />
      <Stack.Screen 
        name="PhotographerManagement" 
        component={PhotographerManagementScreen} 
        options={{ title: 'Manage Photographers' }} 
      />
      <Stack.Screen 
        name="TimeSlotManagement" 
        component={TimeSlotManagementScreen} 
        options={{ title: 'Manage Time Slots' }} 
      />
      <Stack.Screen 
        name="PhotographyBookingManagement" 
        component={PhotographyBookingManagementScreen} 
        options={{ title: 'Manage Bookings' }} 
      />
      <Stack.Screen 
        name="PhotoUpload" 
        component={PhotoUploadScreen} 
        options={{ title: 'Upload Photos' }} 
      />

      <Stack.Screen
        name="AdminEntryTicketsShowBooking"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
      <Stack.Screen name="AdminEventManagement" component={AdminModulePlaceholderScreen} options={adminModulePlaceholderOptions} />
      <Stack.Screen
        name="AdminAnimalInformationEducation"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
      <Stack.Screen name="AdminOnlineStore" component={AdminModulePlaceholderScreen} options={adminModulePlaceholderOptions} />
      <Stack.Screen
        name="AdminFeedbackInquiryReview"
        component={AdminModulePlaceholderScreen}
        options={adminModulePlaceholderOptions}
      />
    </Stack.Navigator>
  );
}
