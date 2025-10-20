import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type HeaderBarProps = {
  title: string;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
};

export default function HeaderBar({ title, rightAction }: HeaderBarProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.wrap}>
      <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#111" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {rightAction ? (
        <Pressable hitSlop={10} onPress={rightAction.onPress}>
          <Ionicons name={rightAction.icon as any} size={22} color="#111" />
        </Pressable>
      ) : (
        <View style={{ width: 22 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  title: { fontSize: 20, fontWeight: '800' },
});


