import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { getGuideByKey, mapLabelToGuide, MaterialGuide } from '@/services/materials';

export default function MaterialGuideScreen() {
  const route = useRoute<any>();
  const materialKey = (route.params?.materialKey as string | undefined) ?? (route.params?.label as string | undefined) ?? 'Other';
  const guide: MaterialGuide = getGuideByKey(materialKey) ?? mapLabelToGuide(materialKey);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{guide.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Category:</Text>
        <Text style={styles.metaValue}>{guide.category}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Bin:</Text>
        <Text style={styles.metaBin}>{guide.bin}</Text>
      </View>
      <Text style={styles.section}>Disposal & Cleaning Tips</Text>
      <FlatList
        data={guide.tips}
        keyExtractor={(t, i) => `${guide.key}-${i}`}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.tipRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.tip}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaLabel: { fontWeight: '700', marginRight: 6 },
  metaValue: { color: '#111827' },
  metaBin: { backgroundColor: '#DCFCE7', color: '#065F46', fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  section: { marginTop: 16, fontWeight: '800' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { marginRight: 8 },
  tip: { flex: 1 },
});


