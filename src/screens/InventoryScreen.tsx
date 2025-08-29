import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { colors, radii } from '@/utils/theme';
import { useHistoryStore } from '@/store/useHistoryStore';

export default function InventoryScreen() {
  const items = useHistoryStore((s) => s.items);
  const data = items.length ? items : [
    { id: 'd1', uri: null, label: 'Wood', timestamp: Date.now() },
    { id: 'd2', uri: null, label: 'Aluminum Can', timestamp: Date.now() },
    { id: 'd3', uri: null, label: 'Plastic', timestamp: Date.now() },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Material Box ( {data.length} )</Text>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.checkbox} />
              {item.uri ? (
                <Image source={{ uri: item.uri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: '#f3f4f6' }]} />
              )}
              <Text style={styles.label}>{item.label}</Text>
              <View style={{ flex: 1 }} />
              <View style={styles.counter}>
                <Pressable style={styles.counterBtn}><Text>+</Text></Pressable>
                <Text style={styles.count}>3</Text>
                <Pressable style={styles.counterBtn}><Text>=</Text></Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <View style={{ gap: 10, marginTop: 12 }}>
        <Pressable style={styles.bigCta}><Text style={styles.bigCtaText}>Scan Your Materials Now and Start Upcycling</Text></Pressable>
        <Pressable style={[styles.bigCta, styles.bigCtaSecondary]}><Text style={[styles.bigCtaText, { color: '#111' }]}>Upload Your Materials Now and Start Upcycling</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 12 },
  header: { fontWeight: '800', marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: radii.l, padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4 },
  thumb: { width: 54, height: 40, borderRadius: 8 },
  label: { fontWeight: '700' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  counterBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  count: { minWidth: 20, textAlign: 'center' },
  bigCta: { backgroundColor: '#111', borderRadius: radii.l, padding: 14, alignItems: 'center' },
  bigCtaSecondary: { backgroundColor: '#e5e7eb' },
  bigCtaText: { color: 'white', fontWeight: '700' },
});


