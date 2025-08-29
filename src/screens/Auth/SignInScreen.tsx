import { View, Text, StyleSheet, TextInput, Pressable, ImageBackground, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { login, googleLogin } from '@/services/auth.api';
import { images } from '@/assets/images';
import Constants from 'expo-constants';
import { useGoogleIdToken } from '@/services/googleAuth';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignInScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  const googleClientId = (Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID as string | undefined)
    || (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID as string | undefined);
  const [request, response, signInWithGoogle] = useGoogleIdToken();

  const onSubmit = async () => {
    if (submitting) return;
    setError(null);
    if (!identifier || !password) {
      setError('Please enter your username/email and password.');
      return;
    }
    try {
      setSubmitting(true);
      const { userId, sessionToken } = await login(identifier, password);
      console.log('Login successful:', { userId, hasSessionToken: !!sessionToken });
      
      if (userId && sessionToken) {
        setAuth(userId, sessionToken);
        // @ts-ignore
        navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
      } else {
        setError('Login failed - invalid response');
      }
    } catch (e: any) {
      const code = e?.data?.error;
      if (code === 'invalid_credentials') setError('Invalid credentials.');
      else setError('Sign in failed. Please try again.');
      console.error('Login error:', e);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ImageBackground source={images.appLogo.bgOfLogin} resizeMode="cover" style={styles.bg} imageStyle={{ opacity: 0.15 }}>
      <View style={styles.header}>
        <Image source={images.appLogo.topLogo} style={{ width: 64, height: 64 }} />
      </View>
      <View style={styles.form}>
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Image source={images.appLogo.topLogo} style={{ width: 80, height: 80, marginBottom: 4 }} />
          <Text style={styles.title}>Sign in</Text>
        </View>
        <TextInput placeholder="Username or Email" autoCapitalize="none" style={styles.input} value={identifier} onChangeText={setIdentifier} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
        <Pressable onPress={() => navigation.navigate('ForgotPassword' as never)}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </Pressable>
        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
        <Pressable style={[styles.cta, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Sign in</Text>}
        </Pressable>

        <View style={{ height: 8 }} />
        <Pressable
          style={[styles.cta, { backgroundColor: '#DB4437' }]}
          onPress={async () => {
            console.log('🚀 Google sign-in button pressed');
            setError(null);
            try {
              console.log('📱 Starting Google OAuth flow...');
              const idToken = await signInWithGoogle();
              console.log('🔑 OAuth result:', { hasIdToken: !!idToken, idTokenLength: idToken?.length });
              
              if (!idToken) {
                console.log('❌ No idToken received');
                setError('Google sign-in canceled');
                return;
              }
              
              console.log('🌐 Calling backend googleLogin API...');
              const { userId, sessionToken } = await googleLogin(idToken);
              console.log('✅ Backend response:', { userId, hasSessionToken: !!sessionToken });
              
              if (userId && sessionToken) {
                console.log('💾 Setting auth state and navigating...');
                setAuth(userId, sessionToken);
                // @ts-ignore
                navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
              } else {
                console.log('❌ Invalid backend response');
                setError('Google sign-in failed - invalid response');
              }
            } catch (e: any) {
              console.error('💥 Google sign-in error:', e);
              const message = e?.data?.error || e?.message || 'Google sign-in error';
              setError(`Google sign-in failed: ${message}`);
            }
          }}
        >
          <Text style={styles.ctaText}>Sign in with Google</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  header: { height: 100, backgroundColor: colors.bg, transform: [{ skewY: '-8deg' }], borderBottomRightRadius: 40 },
  form: { padding: 16, gap: 10 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  input: { backgroundColor: 'white', borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 12 },
  forgot: { alignSelf: 'flex-end', color: '#111', marginBottom: 8 },
  cta: { backgroundColor: '#111', borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  ctaText: { color: 'white', fontWeight: '700' },
});


