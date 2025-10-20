import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function CustomHeader({ title, showBack }: CustomHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {showBack && (
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1e40af" />
        </Pressable>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable style={styles.settingsButton}>
        <Ionicons name="notifications-outline" size={24} color="#1e40af" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  settingsButton: {
    padding: 8,
    marginRight: -8,
  },
});
