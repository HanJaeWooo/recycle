import { View, Text, StyleSheet } from 'react-native';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#6b7280' },
});


