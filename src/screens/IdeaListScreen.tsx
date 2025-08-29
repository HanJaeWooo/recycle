import { View, Text, StyleSheet, FlatList, Image, Pressable, Animated } from 'react-native';
import { colors, radii } from '@/utils/theme';
import { getIdeasForMaterial, Idea } from '@/services/ideas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { images } from '@/assets/images';

export default function IdeaListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const material = (route.params?.material as string | undefined) ?? 'all';
  const ideas = getIdeasForMaterial(material);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROJECT IDEAS{material !== 'all' ? ` • ${material}` : ''}</Text>
      <FlatList
        data={ideas}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item, index }) => (
          <IdeaCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('IdeaDetail', { id: item.id })}
          />
        )}
      />
    </View>
  );
}

function IdeaCard({ item, index, onPress }: { item: Idea; index: number; onPress: () => void }) {
  const toSource = () => {
    if (item.image?.startsWith('local:project:')) {
      const key = item.image.split(':').pop() as keyof typeof images.projectIdeas;
      return images.projectIdeas[key] as any;
    }
    return { uri: item.image } as any;
  };
  const fade = new Animated.Value(0);
  const translateY = new Animated.Value(12);
  Animated.timing(fade, { toValue: 1, duration: 350, delay: 60 * index, useNativeDriver: true }).start();
  Animated.timing(translateY, { toValue: 0, duration: 350, delay: 60 * index, useNativeDriver: true }).start();
  return (
    <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY }] }] }>
      {item.image ? (
        <View style={styles.imageWrap}>
          <Image source={toSource()} style={styles.image} resizeMode="contain" />
        </View>
      ) : null}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Pressable style={styles.cta} onPress={onPress}>
        <Text style={styles.ctaText}>Show me the guidelines →</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 14 },
  title: { fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: 'white', borderRadius: radii.l, padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontWeight: '800', marginTop: 8 },
  imageWrap: { width: '100%', aspectRatio: 16/9, backgroundColor: '#111', borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  cta: { marginTop: 10, backgroundColor: '#111', paddingVertical: 12, borderRadius: radii.pill, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
});


