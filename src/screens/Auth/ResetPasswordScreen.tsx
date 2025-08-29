import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { consumePasswordReset } from '@/services/auth.api';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    setOk(false);
    if (!token || !password) {
      setError('Enter token and new password.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await consumePasswordReset(token, password);
      if (res.ok) {
        setOk(true);
      } else {
        setError('Invalid or expired token.');
      }
    } catch {
      setError('Reset failed, try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <TextInput placeholder="Token" autoCapitalize="none" style={styles.input} value={token} onChangeText={setToken} />
      <TextInput placeholder="New password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
      {ok ? <Text style={{ color: '#16a34a' }}>Password updated. You can sign in now.</Text> : null}
      <Pressable style={[styles.cta, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.ctaText}>Reset</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SignIn' as never)}>
        <Text style={{ alignSelf: 'center', marginTop: 8, textDecorationLine: 'underline' }}>Back to Sign in</Text>
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


