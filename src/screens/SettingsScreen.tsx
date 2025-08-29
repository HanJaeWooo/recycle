import { View, Text, Switch, StyleSheet, Pressable, Image } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '@/components/HeaderBar';
import SettingsRow from '@/components/SettingsRow';
import { images } from '@/assets/images';

export default function SettingsScreen() {
  const useMock = useSettingsStore((s) => s.useMockClassifier);
  const toggle = useSettingsStore((s) => s.toggleMock);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <HeaderBar title="Settings" />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Use Mock Classifier</Text>
          <Text style={styles.help}>Disable to use Google Vision (requires API key)</Text>
        </View>
        <Switch value={useMock} onValueChange={toggle} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable onPress={() => navigation.navigate('Profile' as never)}>
          <View style={styles.iconRow}>
            <Image source={images.settings.myProfile} style={styles.icon} />
            <SettingsRow icon="person" title="My profile" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white', gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontWeight: '700' },
  help: { color: '#6b7280' },
  section: { marginTop: 18 },
  sectionTitle: { fontWeight: '800', marginBottom: 8 },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 24, height: 24, marginRight: 8, resizeMode: 'contain' },
});


