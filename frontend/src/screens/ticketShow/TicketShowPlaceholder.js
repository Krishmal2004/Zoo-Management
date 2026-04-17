import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

/** Wide zoo entrance banner; file lives at `frontend/assets/images/ticket-zoo-hero.png`. */
const TICKET_HERO = require('../../../assets/images/ticket-zoo-hero.png');

/** Display-only sample rates — replace when booking API is wired. */
const ENTRY_TICKET_ROWS = [
  { label: 'Local — Child', price: 'LKR 450' },
  { label: 'Local — Adult', price: 'LKR 900' },
  { label: 'Foreign — Child', price: 'LKR 1,800' },
  { label: 'Foreign — Adult', price: 'LKR 3,500' },
];

const SHOW_ROWS = [
  { name: 'Birds of prey flight', time: '10:00 AM', price: 'LKR 200' },
  { name: 'Elephant care & bath', time: '2:30 PM', price: 'LKR 250' },
  { name: 'Sea lion splash', time: '4:00 PM', price: 'LKR 200' },
  { name: 'Reptile encounter', time: '11:30 AM', price: 'LKR 150' },
];

function InstructionSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PriceRow({ label, value, isLast }) {
  return (
    <View style={[styles.priceRow, isLast && styles.rowLast]}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

function ShowRow({ name, time, price, isLast }) {
  return (
    <View style={[styles.showRow, isLast && styles.rowLast]}>
      <View style={styles.showRowMain}>
        <Text style={styles.showName}>{name}</Text>
        <Text style={styles.showTime}>{time}</Text>
      </View>
      <Text style={styles.showPrice}>{price}</Text>
    </View>
  );
}

export default function TicketShowPlaceholder() {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        <Image
          source={TICKET_HERO}
          style={styles.hero}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Zoo entrance illustration"
        />
        <Text style={styles.title}>Entry Tickets and Show Booking</Text>
        <Text style={styles.intro}>
          Use this guide for day admission and add-on show tickets. Final prices are confirmed at checkout.
        </Text>

        <InstructionSection title="Entry ticket prices (per person)">
          {ENTRY_TICKET_ROWS.map((row, i) => (
            <PriceRow
              key={row.label}
              label={row.label}
              value={row.price}
              isLast={i === ENTRY_TICKET_ROWS.length - 1}
            />
          ))}
        </InstructionSection>

        <InstructionSection title="Animal shows (per seat)">
          <Text style={styles.sectionHint}>Times are typical — check the board at the gate on your visit.</Text>
          {SHOW_ROWS.map((row, i) => (
            <ShowRow
              key={row.name}
              name={row.name}
              time={row.time}
              price={row.price}
              isLast={i === SHOW_ROWS.length - 1}
            />
          ))}
        </InstructionSection>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  hero: {
    width: '100%',
    height: 176,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  intro: {
    fontSize: theme.fontSize.sm,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
    color: theme.colors.primaryText,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.sm,
  },
  sectionHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.75,
    marginBottom: theme.spacing.md,
    lineHeight: Math.round(theme.fontSize.sm * 1.4),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  priceLabel: {
    flex: 1,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    paddingRight: theme.spacing.sm,
  },
  priceValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.accentGreen,
  },
  showRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  showRowMain: { flex: 1, paddingRight: theme.spacing.sm },
  showName: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  showTime: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryText,
    opacity: 0.78,
  },
  showPrice: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.accentGreen,
  },
});
