import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutUsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>ABOUT SNAPCRAFT</Text>
        </View>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../assets/applg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>SNAPCRAFT</Text>
          <Text style={styles.description}>
            Welcome to SNAPCRAFT, an innovative mobile application designed to promote sustainability and green living. Using advanced Convolutional Neural Networks (CNN), this app works through our snapshot-to-materials workflow, empowering you to turn discarded materials into valuable resources.
          </Text>
          <Text style={styles.missionHeader}>Our Mission</Text>
          <Text style={styles.missionText}>
            Our mission is to help users identify recyclable materials and discover unique ways to repurpose them. Whether you're a DIY enthusiast, sustainability advocate, or crafting enthusiast, SNAPCRAFT is committed to providing solutions for turning waste into wonderful upcycled projects.
          </Text>
          <Text style={styles.missionText}>
            We are dedicated to making recycling and upcycling easier, more accessible, and fun for everyone. Thank you for joining us on our journey toward a more sustainable future! 🌱♻️
          </Text>
          <View style={styles.contactSection}>
            <Text style={styles.contactHeader}>Contact us:</Text>
            <Text style={styles.email}>snapcraft217@gmail.com</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2E0AE',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2E0AE',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C65C1C',
    padding: 16,
    paddingTop: 20,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -4,
  },
  title: {
    flex: 1,
    fontWeight: '800',
    fontSize: 24,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  missionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#4B5563',
  },
});