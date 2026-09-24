import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (loading) return;
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.password.length < (mode === 'signup' ? 8 : 1)) return setError('Password must be at least 8 characters.');
    if (mode === 'signup' && form.name.trim().length < 2) return setError('Enter your name.');

    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') await login(form.email.trim(), form.password);
      else await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const input = { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, backgroundColor: '#fff', marginBottom: 12, color: colors.text };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 20 }}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>

        {mode === 'signup' && <TextInput style={input} placeholder="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />}
        <TextInput style={input} placeholder="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={input} placeholder="Password" value={form.password} onChangeText={set('password')} secureTextEntry />

        {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}

        <TouchableOpacity onPress={submit} disabled={loading} style={{ backgroundColor: colors.primaryDark, borderRadius: 12, padding: 14, alignItems: 'center' }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{mode === 'login' ? 'Log in' : 'Sign up'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }} style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 28 }}>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>Demo account: demo@feedants.com / Demo@1234</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
