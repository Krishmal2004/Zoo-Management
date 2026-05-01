import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validation';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🦁</Text>
          </View>
          <Text style={styles.title}>Zoo Management</Text>
          <Text style={styles.subtitle}>Sign in to your staff or visitor account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={[styles.input, errors.email && styles.inputError]} 
              value={email} 
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={[styles.input, errors.password && styles.inputError]} 
              value={password} 
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, submitting && styles.disabledBtn]} 
            onPress={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')} 
            style={styles.registerLink}
          >
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  flex: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E9',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  logoEmoji: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#F9F9F9', 
    borderRadius: 15, 
    padding: 18, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  inputError: { borderColor: '#FF5252' },
  errorText: { color: '#FF5252', fontSize: 12, marginTop: 5, marginLeft: 5 },
  loginBtn: { 
    backgroundColor: '#4CAF50', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
  registerLink: { marginTop: 25, alignItems: 'center' },
  linkText: { fontSize: 15, color: '#666' },
  linkBold: { color: '#4CAF50', fontWeight: 'bold' },
});
