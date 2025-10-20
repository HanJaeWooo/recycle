import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '@/components/HeaderBar';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useState } from 'react';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const clearAuth = useAuthStore((s) => s.clear);
  const completedProjects = useProjectStore((s) => s.completedProjects);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  console.log('⚙️ Settings: Completed projects count:', completedProjects.length);

  const handleLogout = () => {
    const performLogout = () => {
      clearAuth();
      // Force navigation reset for web platform
      if (Platform.OS === 'web') {
        // Clear any cached navigation state
        navigation.reset({
          index: 0,
          routes: [{ name: 'Landing' as never }],
        });
      } else {
        navigation.navigate('Landing' as never);
      }
    };

    if (Platform.OS === 'web') {
      // Use native confirm for web
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout', 
            style: 'destructive', 
            onPress: performLogout
          }
        ]
      );
    }
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      'Switch Account',
      'This will log you out and allow you to sign in with a different account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch', 
          onPress: () => {
            clearAuth();
            navigation.navigate('SignIn' as never);
          }
        }
      ]
    );
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleGuides = () => {
    navigation.navigate('Guides' as never);
  };

  const handleAboutUs = () => {
    Alert.alert(
      'About SNAPCRAFT',
      'SNAPCRAFT - Your AI-powered recycling companion app that helps you scan, identify, and turn waste into wonderful upcycled projects.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
      <HeaderBar title="Settings" />
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Account</Text>
        <Pressable style={styles.settingRow} onPress={() => navigation.navigate('Profile' as never)}>
          <Text style={styles.settingText}>My profile</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      {/* Projects Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Projects</Text>
        <Pressable style={styles.settingRow} onPress={() => navigation.navigate('ProjectHistory' as never)}>
          <Text style={styles.settingText}>Finished Projects</Text>
          <View style={styles.rowRight}>
            {completedProjects.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{completedProjects.length}</Text>
              </View>
            )}
            <Text style={styles.arrow}>›</Text>
          </View>
        </Pressable>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notification Settings</Text>
        <Pressable style={styles.settingRow} onPress={handleNotificationToggle}>
          <Text style={styles.settingText}>Notification</Text>
          <View style={[styles.toggle, !notificationsEnabled && styles.toggleDisabled]}>
            <View style={[styles.toggleActive, !notificationsEnabled && styles.toggleInactive]} />
          </View>
        </Pressable>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎧 Help & Support</Text>
        <Pressable style={styles.settingRow} onPress={handleGuides}>
          <Text style={styles.settingText}>Guides</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable style={styles.settingRow} onPress={handleAboutUs}>
          <Text style={styles.settingText}>About us</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      {/* Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 LOGIN</Text>
        <Pressable style={styles.settingRow} onPress={handleSwitchAccount}>
          <Text style={styles.settingText}>Switch account</Text>
        </Pressable>
        <Pressable style={styles.settingRow} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2E0AE' },
  container: { 
    flex: 1, 
    backgroundColor: '#F2E0AE' 
  },
  section: { 
    marginTop: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16
  },
  sectionTitle: { 
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  settingText: {
    fontSize: 16,
    color: '#374151'
  },
  arrow: {
    fontSize: 18,
    color: '#9ca3af'
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#10b981',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 2
  },
  toggleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  toggleDisabled: {
    backgroundColor: '#d1d5db'
  },
  toggleInactive: {
    transform: [{ translateX: -20 }]
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600'
  }
});


