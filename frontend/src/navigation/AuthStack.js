import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TicketShowPlaceholder from '../screens/ticketShow/TicketShowPlaceholder';
import EventsPlaceholder from '../screens/events/EventsPlaceholder';
import FeedbackPlaceholder from '../screens/feedback/FeedbackPlaceholder';
import AnimalsPlaceholder from '../screens/animals/AnimalsPlaceholder';
import EncountersPlaceholder from '../screens/encounters/EncountersPlaceholder';
import StorePlaceholder from '../screens/store/StorePlaceholder';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="TicketShow" component={TicketShowPlaceholder} options={{ title: 'Tickets & Shows' }} />
      <Stack.Screen name="Events" component={EventsPlaceholder} options={{ title: 'Events' }} />
      <Stack.Screen name="Feedback" component={FeedbackPlaceholder} options={{ title: 'Feedback' }} />
      <Stack.Screen name="Animals" component={AnimalsPlaceholder} options={{ title: 'Animals' }} />
      <Stack.Screen name="Encounters" component={EncountersPlaceholder} options={{ title: 'Encounters' }} />
      <Stack.Screen name="Store" component={StorePlaceholder} options={{ title: 'Store' }} />
    </Stack.Navigator>
  );
}
