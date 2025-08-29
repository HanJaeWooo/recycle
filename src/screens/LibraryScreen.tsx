import { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable } from 'react-native';
import { getIdeasForMaterial } from '@/services/ideas';

type Idea = { id: string; title: string; description: string; material: string };

export default function LibraryScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    setIdeas(getIdeasForMaterial('all'));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.tag}>{item.material}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Pressable style={styles.cta} onPress={() => {}}>
              <Text style={styles.ctaText}>View Tutorial</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  sep: { height: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, gap: 6 },
  title: { fontWeight: '800', fontSize: 16 },
  desc: { color: '#4b5563' },
  tag: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb', color: '#111827', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 12 },
  cta: { marginTop: 8, backgroundColor: '#1d4ed8', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
});


