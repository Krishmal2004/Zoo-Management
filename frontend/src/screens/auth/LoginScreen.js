import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validation';
import { theme } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    const v = validateLoginForm({ email, password });
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer backgroundColor="#E8F5E9">
      <View style={styles.header}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.sub}>Welcome back! Please enter your details.</Text>
      </View>

      <TextField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <PrimaryButton title="Sign in" onPress={onSubmit} loading={submitting} style={styles.btn} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
        <Text style={styles.linkMuted}>Don't have an account? </Text>
        <Text style={styles.linkBold}>Register now</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.hero,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  sub: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primaryText,
    opacity: 0.85,
  },
  btn: {
    marginTop: theme.spacing.md,
  },
  linkWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  linkMuted: {
    color: theme.colors.black,
    fontSize: theme.fontSize.body,
  },
  linkBold: {
    color: theme.colors.linkGreen,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
  },
});
