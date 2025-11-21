import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { login } from '@/services/auth.api';
import { images } from '@/assets/images';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignInScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

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
        await setAuth(userId, sessionToken);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={images.appLogo.topLogo} style={styles.logo} />
          <View style={{ flex: 1 }} />
          <Pressable 
            onPress={() => navigation.navigate('SignUp' as never)}
            style={styles.signUpButton}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image source={images.appLogo.topLogo} style={styles.cardLogo} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <TextInput 
            placeholder="Username or Email" 
            autoCapitalize="none" 
            style={styles.input} 
            value={identifier} 
            onChangeText={setIdentifier}
            placeholderTextColor="#94a3b8"
          />
          <TextInput 
            placeholder="Password" 
            secureTextEntry 
            style={styles.input} 
            value={password} 
            onChangeText={setPassword}
            placeholderTextColor="#94a3b8"
          />
          
          <Pressable onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <LinearGradient 
            colors={['#D2691E', '#8B4513']} 
            style={styles.ctaButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Pressable 
              style={[styles.ctaInner, submitting && { opacity: 0.7 }]}
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Sign In</Text>
              )}
            </Pressable>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAEAB1',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  signUpButton: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  forgot: {
    alignSelf: 'flex-end',
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    fontSize: 14,
  },
  ctaButton: {
    borderRadius: 16,
    shadowColor: '#D2691E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
});


