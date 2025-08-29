import { View, Text, StyleSheet, Pressable } from 'react-native';
import HeaderBar from '@/components/HeaderBar';
import { colors } from '@/utils/theme';

const rows = [
  { title: 'How to use the app?', desc: 'Step-by-step guide on scanning materials and getting upcycling suggestions.' },
  { title: 'Understanding Image-based recognition', desc: 'Explanation of how image recognition of materials works.' },
  { title: 'Terms of Service', desc: 'Rules and conditions users must follow.' },
  { title: 'Privacy Policy', desc: 'How data is collected, stored, and protected.' },
];

export default function GuidesScreen() {
  return (
    <View style={styles.container}>
      <HeaderBar title="Guides" />
      <Text style={styles.heading}>Guides</Text>
      {rows.map((r) => (
        <Pressable key={r.title} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{r.title}</Text>
            <Text style={styles.desc}>{r.desc}</Text>
          </View>
          <Text>⌄</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  heading: { fontSize: 24, fontWeight: '800', alignSelf: 'center', marginVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTitle: { fontWeight: '700' },
  desc: { color: '#6b7280' },
});


