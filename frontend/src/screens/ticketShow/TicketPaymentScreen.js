import React from 'react';
import { View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

export default function TicketPaymentScreen() {
  return (
    <ScreenContainer backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.container} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
