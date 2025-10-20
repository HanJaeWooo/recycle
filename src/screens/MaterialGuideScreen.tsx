import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { getGuideByKey, mapLabelToGuide, MaterialGuide } from '@/services/materials';

export default function MaterialGuideScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const materialKey = (route.params?.materialKey as string | undefined) ?? (route.params?.label as string | undefined) ?? 'Other';
  const guide: MaterialGuide = getGuideByKey(materialKey) ?? mapLabelToGuide(materialKey);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{guide.title}</Text>
      </View>

      {/* Meta Info */}
      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category:</Text>
          <Text style={styles.metaValue}>{guide.category}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Bin:</Text>
          <Text style={styles.metaBin}>{guide.bin}</Text>
        </View>
      </View>

      {/* Tips Section */}
      <Text style={styles.section}>Disposal & Cleaning Tips</Text>
      <FlatList
        data={guide.tips}
        keyExtractor={(t, i) => `${guide.key}-${i}`}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.tipRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.tip}>{item}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 6,
    marginRight: 12,
    borderRadius: radii.sm,
    backgroundColor: '#F3F4F6',
  },
  backText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  title: { fontSize: 22, fontWeight: '900', color: '#111827', flexShrink: 1 },

  metaCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: radii.md,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaLabel: { fontWeight: '700', marginRight: 6, color: '#374151' },
  metaValue: { color: '#111827', fontWeight: '600' },
  metaBin: { 
    backgroundColor: '#DCFCE7', 
    color: '#065F46', 
    fontWeight: '700', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: radii.pill 
  },

  section: { fontWeight: '800', fontSize: 16, color: '#1F2937', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { marginRight: 8, fontSize: 16, lineHeight: 22, color: '#6B7280' },
  tip: { flex: 1, color: '#374151', lineHeight: 22 },
});
