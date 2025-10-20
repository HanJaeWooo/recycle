import { View, Text, StyleSheet, Image, Pressable, Animated, Easing, ImageBackground, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii } from '@/utils/theme';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '@/assets/images';

export default function LandingScreen() {
  const navigation = useNavigation();
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [rotate, pulse]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* Logo Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/icon.jpg')} style={styles.logo} />
          <Text style={styles.appName}>SNAPCRAFT</Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.animationWrap}>
            <Animated.View style={[styles.pulse, { transform: [{ scale }] }]} />
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <MaterialCommunityIcons name="recycle" size={80} color="#16a34a" />
            </Animated.View>
          </View>
          <Text style={styles.heroTitle}>Scan • Repurpose • Innovate</Text>
          <Text style={styles.heroSubtitle}>Turn discarded materials into useful projects with AI guidance</Text>
        </View>

        {/* CTA Button */}
        <LinearGradient 
          colors={['#D2691E', '#8B4513']} 
          style={styles.ctaButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Pressable 
            style={styles.ctaInner}
            onPress={() => navigation.navigate('Onboarding' as never)}
          >
            <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#fff" />
            <Text style={styles.ctaText}>Get Started</Text>
          </Pressable>
        </LinearGradient>

        {/* Sign In Link */}
        <Pressable 
          style={styles.signInLink}
          onPress={() => navigation.navigate('SignIn' as never)}
        >
          <Text style={styles.signInText}>Already have an account? </Text>
          <Text style={styles.signInTextBold}>Sign In</Text>
        </Pressable>
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
    padding: 20, 
    justifyContent: 'space-between' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logo: { 
    width: 60, 
    height: 60, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B4513',
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 40,
  },
  animationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 140,
  },
  pulse: { 
    position: 'absolute', 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    backgroundColor: '#DCFCE7' 
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButton: {
    borderRadius: 20,
    marginTop: 'auto',
    shadowColor: '#D2691E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: { 
    color: 'white', 
    fontWeight: '800',
    fontSize: 18,
  },
  signInLink: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  signInText: {
    fontSize: 15,
    color: '#64748b',
  },
  signInTextBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B4513',
  },
});


