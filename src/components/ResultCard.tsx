import { View, Text, StyleSheet } from 'react-native';

export default function ResultCard({ label, confidence }: { label: string; confidence: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.meta}>{Math.round(confidence * 100)}% confidence</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 12, borderRadius: 10 },
  title: { fontWeight: '800' },
  meta: { color: '#6b7280' },
});


