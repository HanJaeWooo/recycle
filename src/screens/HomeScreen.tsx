import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable, StyleSheet, FlatList, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { images } from '@/assets/images';


const categories = [
  { id: 'plastic', title: 'Plastic' },
  { id: 'glass', title: 'Glass' },
  { id: 'metal', title: 'Metal' },
  { id: 'paper', title: 'Paper' },
  { id: 'cardboard', title: 'Cardboard' },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ImageBackground source={images.appLogo.bgLogo} style={styles.hero} imageStyle={{ opacity: 0.2 }}>
        <Text style={styles.title}>Turn Waste into Wonder</Text>
        <Text style={styles.subtitle}>Scan, identify, and upcycle materials</Text>
        <Pressable style={styles.cta} onPress={() => navigation.navigate('Capture' as never)}>
          <Text style={styles.ctaText}>Start Scanning</Text>
        </Pressable>
      </ImageBackground>
      <Text style={styles.section}>Browse by Material</Text>
      <FlatList
        data={categories}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('Library' as never, { material: item.title } as never)}>
            <Text style={styles.cardText}>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  hero: { borderRadius: 16, padding: 20, gap: 8, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#374151' },
  cta: { marginTop: 8, backgroundColor: '#1d4ed8', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
  section: { fontWeight: '800', marginBottom: 8, marginTop: 4 },
  card: { flex: 1, backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  cardText: { fontWeight: '700' },
});


