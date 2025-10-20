import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/HomeScreen';
import CaptureScreen from '@/screens/CaptureScreen';
import InventoryScreen from '@/screens/InventoryScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { TabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<TabParamList>();

// 🧭 Custom Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const currentRoute = state.routes[state.index].name;

  // Hide the navigation bar on CaptureScreen
  if (currentRoute === 'Capture') return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            History: 'time',
            Inventory: 'cube',
            Settings: 'settings',
          };

          // Only show these four tabs
          if (!iconMap[route.name]) return null;

          const iconName = iconMap[route.name] ?? 'ellipse';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabButton, isFocused && styles.activeTab]}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? '#fff' : '#A3A3A3'}
              />
              <Text
                style={[styles.tabLabel, isFocused && styles.activeTabLabel]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar completely
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Capture" component={CaptureScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2E2E2E', // lighter than background
    borderRadius: 40,
    width: '90%',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 30,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    color: '#A3A3A3',
  },
  activeTab: {
    backgroundColor: '#F59E0B', // orange glow highlight
    shadowColor: '#F59E0B',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,
  },
  activeTabLabel: {
    color: '#fff',
  },
});
