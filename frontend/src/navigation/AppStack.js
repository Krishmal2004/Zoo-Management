import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/home/DashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TicketShowPlaceholder from '../screens/ticketShow/TicketShowPlaceholder';
import EventsPlaceholder from '../screens/events/EventsPlaceholder';
import FeedbackPlaceholder from '../screens/feedback/FeedbackPlaceholder';
import AnimalsPlaceholder from '../screens/animals/AnimalsPlaceholder';
import EncountersPlaceholder from '../screens/encounters/EncountersPlaceholder';
import StorePlaceholder from '../screens/store/StorePlaceholder';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="TicketShow" component={TicketShowPlaceholder} options={{ title: 'Tickets & Shows' }} />
      <Stack.Screen name="Events" component={EventsPlaceholder} options={{ title: 'Events' }} />
      <Stack.Screen name="Feedback" component={FeedbackPlaceholder} options={{ title: 'Feedback' }} />
      <Stack.Screen name="Animals" component={AnimalsPlaceholder} options={{ title: 'Animals' }} />
      <Stack.Screen name="Encounters" component={EncountersPlaceholder} options={{ title: 'Encounters' }} />
      <Stack.Screen name="Store" component={StorePlaceholder} options={{ title: 'Store' }} />
    </Stack.Navigator>
  );
}
