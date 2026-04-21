import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { theme } from '../../constants/theme';
import { formatLkr } from '../../constants/entryTickets';

export default function TicketPaymentScreen() {
  const route = useRoute();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const entrySubtotalLkr = route.params?.entrySubtotalLkr ?? 0;
  const showsSubtotalLkr = route.params?.showsSubtotalLkr ?? 0;
  const totalLkr = useMemo(
    () => route.params?.totalLkr ?? entrySubtotalLkr + showsSubtotalLkr,
    [route.params?.totalLkr, entrySubtotalLkr, showsSubtotalLkr]
  );

  const onPayNow = () => {
    if (!cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      Alert.alert('Payment details', 'Please fill in all payment details.');
      return;
    }

    Alert.alert('Payment successful', `Payment of ${formatLkr(totalLkr)} completed.`);
  };

  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entry tickets subtotal</Text>
            <Text style={styles.summaryValue}>{formatLkr(entrySubtotalLkr)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Show tickets subtotal</Text>
            <Text style={styles.summaryValue}>{formatLkr(showsSubtotalLkr)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalValue}>{formatLkr(totalLkr)}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Payment details</Text>
          <TextField
            label="Cardholder name"
            value={cardholderName}
            onChangeText={setCardholderName}
            placeholder="Name on card"
            autoCapitalize="words"
          />
          <TextField
            label="Card number"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          <View style={styles.inlineInputs}>
            <View style={styles.halfInput}>
              <TextField
                label="Expiry date"
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.halfInput}>
              <TextField
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <PrimaryButton title="Pay now" onPress={onPayNow} style={styles.payButton} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    opacity: 0.85,
  },
  summaryValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.sage,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  totalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.accentGreen,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  payButton: {
    marginTop: theme.spacing.sm,
  },
});
