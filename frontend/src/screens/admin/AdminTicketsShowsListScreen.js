import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AccountDrawerLayout from '../../components/profile/AccountDrawerLayout';
import { theme } from '../../constants/theme';
import { ENTRY_TICKET_TYPES, formatLkr } from '../../constants/entryTickets';
import { getTicketShowPlaceholderRows } from '../../constants/ticketShowCatalog';
import { getAdminDrawerMenuItems } from './adminNavigation';

const ENTRY_TICKET_ROWS = ENTRY_TICKET_TYPES.map((ticket) => ({
  label: ticket.label,
  price: formatLkr(ticket.priceLkr),
}));

const SHOW_ROWS = getTicketShowPlaceholderRows();

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rowsPanel}>{children}</View>
    </View>
  );
}

function TicketRow({ label, value, isLast }) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ShowRow({ name, time, price, isLast }) {
  return (
    <View style={[styles.showRow, !isLast && styles.rowDivider]}>
      <View style={styles.showMain}>
        <Text style={styles.rowLabel}>{name}</Text>
        <Text style={styles.showTime}>{time}</Text>
      </View>
      <Text style={styles.rowValue}>{price}</Text>
    </View>
  );
}

export default function AdminTicketsShowsListScreen({ navigation }) {
  const drawerMenuItems = useMemo(() => getAdminDrawerMenuItems(navigation), [navigation]);

  return (
    <AccountDrawerLayout headerTitle="Explore" drawerMenuItems={drawerMenuItems}>
      <View style={styles.heroCard} accessibilityRole="header">
        <Text style={styles.title}>Manage Tickets and Shows</Text>
        <Text style={styles.sub}>Available entry tickets and animal shows.</Text>
      </View>

      <Section title="Available Entry Tickets">
        {ENTRY_TICKET_ROWS.map((item, index) => (
          <TicketRow
            key={item.label}
            label={item.label}
            value={item.price}
            isLast={index === ENTRY_TICKET_ROWS.length - 1}
          />
        ))}
      </Section>

      <Section title="Available Shows">
        {SHOW_ROWS.map((item, index) => (
          <ShowRow
            key={item.name}
            name={item.name}
            time={item.time}
            price={item.price}
            isLast={index === SHOW_ROWS.length - 1}
          />
        ))}
      </Section>
    </AccountDrawerLayout>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.welcomeBackground,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.sage,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentGreen,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
  sub: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    lineHeight: Math.round(theme.fontSize.sm * 1.45),
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.linkGreen,
    marginBottom: theme.spacing.sm,
  },
  rowsPanel: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  showRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  showMain: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  rowLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  showTime: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
  },
  rowValue: {
    fontSize: theme.fontSize.body,
    fontWeight: '700',
    color: theme.colors.linkGreen,
  },
});
