import { View, Text, StyleSheet, FlatList, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, radii } from '@/utils/theme';
import { getGuideByKey, mapLabelToGuide, MaterialGuide } from '@/services/materials';
import HeaderBar from '@/components/HeaderBar';

export default function MaterialGuideScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const materialKey = (route.params?.materialKey as string | undefined) ?? (route.params?.label as string | undefined) ?? 'Other';
  const guide: MaterialGuide = getGuideByKey(materialKey) ?? mapLabelToGuide(materialKey);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <HeaderBar title={guide.title} />
      
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <>
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
          </>
        )}
        data={guide.tips}
        keyExtractor={(t, i) => `${guide.key}-${i}`}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.tipRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.tip}>{item}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90, // Extra padding for navigation bar
  },

  metaCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: radii.m,
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
