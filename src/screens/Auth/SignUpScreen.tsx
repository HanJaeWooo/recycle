import { View, Text, StyleSheet, TextInput, Pressable, ImageBackground, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { register } from '@/services/auth.api';
import { images } from '@/assets/images';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    if (!fullName || !username || !password || !email) {
      setError('Please fill all fields.');
      return;
    }
    if (!agree) {
      setError('Please accept the Terms and Privacy policy.');
      return;
    }
    try {
      setSubmitting(true);
      await register({ email, username, fullName, password, acceptTerms: true, acceptPrivacy: true });
      // Navigate to sign-in on success
      // @ts-ignore
      navigation.navigate('SignIn');
    } catch (e: any) {
      if (e?.code === 'network_error') {
        setError(`Cannot reach API at ${e.base}. Is the server running?`);
        return;
      }
      const code = e?.data?.error;
      if (code === 'email_taken') setError('Email is already taken.');
      else if (code === 'username_taken') setError('Username is already taken.');
      else setError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ImageBackground source={images.appLogo.bgOfReg} resizeMode="cover" style={styles.bg} imageStyle={{ opacity: 0.15 }}>
      <View style={styles.headerAngle}>
        <Image source={images.appLogo.topLogo} style={{ width: 64, height: 64 }} />
      </View>
      <View style={styles.form}>
        <Pressable style={{ alignSelf: 'flex-end' }} onPress={() => navigation.navigate('SignIn' as never)}>
          <Text style={styles.headerRight}>Sign in</Text>
        </Pressable>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Please register to login</Text>
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Image source={images.appLogo.topLogo} style={{ width: 80, height: 80 }} />
        </View>
        <TextInput placeholder="Enter your name" style={styles.input} value={fullName} onChangeText={setFullName} />
        <TextInput placeholder="Enter username" style={styles.input} autoCapitalize="none" value={username} onChangeText={setUsername} />
        <TextInput placeholder="Enter password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
        <TextInput placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" style={styles.input} value={email} onChangeText={setEmail} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => setAgree(!agree)} accessibilityRole="checkbox" accessibilityState={{ checked: agree }}>
            <View style={styles.checkbox}>
              {agree ? <Ionicons name="checkmark" size={14} color="#16a34a" /> : null}
            </View>
          </Pressable>
          <Text>I agree with the Terms of Service and Privacy policy</Text>
        </View>
        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
        <Pressable style={[styles.cta, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Create Account</Text>}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.card },
  headerAngle: { height: 100, backgroundColor: colors.bg, transform: [{ skewY: '-10deg' }], borderBottomRightRadius: 40 },
  form: { padding: 16, gap: 10 },
  headerRight: { alignSelf: 'flex-end', fontSize: 24, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#6b7280', marginBottom: 8 },
  input: { backgroundColor: 'white', borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 12 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  cta: { marginTop: 8, backgroundColor: '#111', borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
});


