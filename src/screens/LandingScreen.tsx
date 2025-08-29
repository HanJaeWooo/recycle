import { View, Text, StyleSheet, Image, Pressable, Animated, Easing, ImageBackground } from 'react-native';
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
    <View style={styles.container}>
      <Image source={require('../../assets/icon.jpg')} style={styles.logo} />
      <View style={styles.headerWrap}>
        <Text style={styles.h1}>Scan{"\n"}Repurpose{"\n"}Innovate</Text>
        <ImageBackground source={images.appLogo.bgLogo} style={styles.heroImage} imageStyle={{ borderRadius: radii.l, opacity: 0.3 }} />
      </View>
      <View style={styles.center}>
        <Animated.View style={[styles.pulse, { transform: [{ scale }] }]} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="recycle" size={84} color="#16a34a" />
        </Animated.View>
      </View>
      <Text style={styles.tagline}>Let AI guide you in turning discarded materials into useful projects!</Text>
      <Pressable style={styles.cta} onPress={() => navigation.navigate('Onboarding' as never)}>
        <Text style={styles.ctaText}>Get Started</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SignIn' as never)}>
        <Text style={styles.signin}>Already have an account?  <Text style={{ textDecorationLine: 'underline' }}>Sign in</Text></Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, padding: 16, gap: 14 },
  logo: { width: 56, height: 56, borderRadius: radii.l, alignSelf: 'flex-start' },
  headerWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  h1: { flex: 1, fontSize: 32, fontWeight: '900', lineHeight: 36 },
  heroImage: { width: 140, height: 160, borderRadius: radii.l },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 6, minHeight: 120 },
  pulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#DCFCE7' },
  tagline: { color: '#ea580c', fontWeight: '700' },
  cta: { marginTop: 'auto', backgroundColor: '#111', paddingVertical: 14, borderRadius: radii.pill, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
  signin: { alignSelf: 'center', marginTop: 8 },
});


