import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Image, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={images.appLogo.topLogo} style={styles.logo} />
          <View style={{ flex: 1 }} />
          <Pressable 
            onPress={() => navigation.navigate('SignIn' as never)}
            style={styles.signInButton}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>

        {/* Signup Card */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.signupCard}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Image source={images.appLogo.topLogo} style={styles.cardLogo} />
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join SNAPCRAFT today</Text>
            </View>
            <TextInput 
              placeholder="Full Name" 
              style={styles.input} 
              value={fullName} 
              onChangeText={setFullName}
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              placeholder="Username" 
              style={styles.input} 
              autoCapitalize="none" 
              value={username} 
              onChangeText={setUsername}
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              placeholder="Email" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Pressable onPress={() => setAgree(!agree)} accessibilityRole="checkbox" accessibilityState={{ checked: agree }}>
                <View style={styles.checkbox}>
                  {agree ? <Ionicons name="checkmark" size={16} color="#16a34a" /> : null}
                </View>
              </Pressable>
              <Text style={styles.agreementText}>I agree with the Terms and Privacy policy</Text>
            </View>

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
                  <Text style={styles.ctaText}>Create Account</Text>
                )}
              </Pressable>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FAEAB1' 
  },
  container: { 
    flex: 1, 
    padding: 20 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  signInButton: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
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
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  ctaButton: {
    borderRadius: 16,
    marginTop: 20,
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


