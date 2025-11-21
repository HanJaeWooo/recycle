import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const getIconName = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Inventory':
      return focused ? 'cube' : 'cube-outline';
    case 'History':
      return focused ? 'time' : 'time-outline';
    case 'Settings':
      return focused ? 'settings' : 'settings-outline';
    default:
      return 'ellipse';
  }
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const animatedValues = useRef(state.routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    state.routes.forEach((_, i) => {
      Animated.spring(animatedValues[i], {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#222222', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const anim = animatedValues[index];
          if (!anim) return null;

          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          });

          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} style={styles.tab} onPress={handlePress}>
              <Animated.View style={[styles.iconWrapper, { transform: [{ translateY }, { scale }] }]}>
                <View
                  style={[
                    styles.iconBackground,
                    isFocused && styles.activeIconBackground,
                  ]}
                >
                  <Ionicons
                    name={getIconName(route.name, isFocused)}
                    size={22}
                    color={isFocused ? '#000' : '#fff'}
                  />
                </View>
                {isFocused && (
                  <Text style={styles.activeLabel}>
                    {typeof label === 'string' ? label : route.name}
                  </Text>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  container: {
    flexDirection: 'row',
    height: 65,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 30,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconBackground: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 4,
  },
  activeIconBackground: {
    backgroundColor: '#FF9500',
  },
  activeLabel: {
    color: '#FF9500',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
});
