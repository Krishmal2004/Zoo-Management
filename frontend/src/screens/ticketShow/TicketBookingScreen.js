import React from 'react';
import { View } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

/** Placeholder route for the future booking form. */
export default function TicketBookingScreen() {
  return (
    <ScreenContainer backgroundColor={theme.colors.backgroundAlt}>
      <View style={{ flex: 1 }} />
    </ScreenContainer>
  );
}
