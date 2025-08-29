import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { requestPasswordReset } from '@/services/auth.api';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting) return;
    setInfo(null);
    setError(null);
    if (!email) {
      setError('Enter your email.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await requestPasswordReset(email);
      if (res?.token) {
        setInfo(`Reset token (dev only): ${res.token}`);
      } else {
        setInfo('If this email exists, a reset link was sent.');
      }
    } catch {
      setError('Request failed, try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />
      {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
      {info ? <Text style={{ color: '#16a34a' }}>{info}</Text> : null}
      <Pressable style={[styles.cta, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.ctaText}>Send reset link</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('ResetPassword' as never)}>
        <Text style={{ alignSelf: 'center', marginTop: 8, textDecorationLine: 'underline' }}>I already have a token</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 10, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  input: { backgroundColor: 'white', borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 12 },
  cta: { backgroundColor: '#111', borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ctaText: { color: 'white', fontWeight: '700' },
});


