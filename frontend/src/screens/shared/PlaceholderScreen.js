import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { theme } from '../../constants/theme';

export default function PlaceholderScreen({ title, emoji, body }) {
  return (
    <ScreenContainer scroll backgroundColor={theme.colors.backgroundAlt}>
      <View style={styles.inner}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.note}>Prepared for Phase 2 — API module stub is available on the backend.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: { paddingTop: theme.spacing.md },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: theme.spacing.sm },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.body,
    color: theme.colors.primaryText,
    lineHeight: 22,
    textAlign: 'center',
  },
  note: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accentGreen,
    textAlign: 'center',
    fontWeight: '600',
  },
});
