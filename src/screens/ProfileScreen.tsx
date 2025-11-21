import { View, Text, StyleSheet, TextInput, Pressable, Alert, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '@/utils/theme';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { updateProfile, changePassword, fetchProfile } from '@/services/auth.api';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    username: string;
    full_name?: string;
  }>({
    id: '',
    email: '',
    username: '',
    full_name: ''
  });

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isModified, setIsModified] = useState(false);

  const userId = useAuthStore((s) => s.userId);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch user profile data when screen loads
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching profile - Current userId:', userId);
        
        if (!userId) {
          console.warn('No userId available - cannot fetch profile');
          // User is not logged in - silently return without showing error
          // The navigation will handle redirecting to sign-in screen
          return;
        }

        console.log('Attempting to fetch profile for userId:', userId);
        const fetchedProfile = await fetchProfile(userId);
        console.log('Profile retrieved:', fetchedProfile);
        
        // Update profile state
        setProfile(fetchedProfile);
        
        // Set form fields
        // Prioritize full_name, fallback to username if full_name is not available
        const displayName = fetchedProfile.full_name || 
          (fetchedProfile.username ? 
            fetchedProfile.username.split(/(?=\d)/)[0].charAt(0).toUpperCase() + 
            fetchedProfile.username.split(/(?=\d)/)[0].slice(1) : 
            '');
        
        setFullName(displayName);
        setUsername(fetchedProfile.username);
        setEmail(fetchedProfile.email);
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        
        if (error.status === 401) {
          // Token expired or invalid
          Alert.alert(
            'Session Expired', 
            'Your session has expired. Please log in again.',
            [{ 
              text: 'Sign In', 
              onPress: () => {
                // Clear auth store and navigate to sign in
                useAuthStore.getState().clear();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' as never }]
                });
              } 
            }]
          );
        } else {
          // Generic error
          Alert.alert(
            'Profile Fetch Error', 
            error.message || 'Failed to load profile. Please check your connection and try again.',
            [{ 
              text: 'Retry', 
              onPress: fetchUserProfile 
            }, { 
              text: 'Sign Out', 
              onPress: () => {
                useAuthStore.getState().clear();
                navigation.navigate('SignIn' as never);
              } 
            }]
          );
        }
      }
    };

    fetchUserProfile();
  }, [userId, navigation]);

  const handleSave = async () => {
    try {
      // Sanitize full name input
      const sanitizedFullName = fullName.trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Sanitize username input
      const sanitizedUsername = username.trim().toLowerCase().replace(/\s+/g, '');

      // Check if anything actually changed
      const fullNameChanged = sanitizedFullName !== profile.full_name;
      const usernameChanged = sanitizedUsername !== profile.username;

      // Only update if something has changed
      if (fullNameChanged || usernameChanged) {
        const updateData: { fullName?: string; username?: string } = {};
        
        if (fullNameChanged) {
          updateData.fullName = sanitizedFullName;
        }
        
        if (usernameChanged) {
          updateData.username = sanitizedUsername;
        }

        const result = await updateProfile(updateData);
        
        // Update local profile state
        setProfile(prevProfile => ({
          ...prevProfile,
          ...(result.profile.full_name && { full_name: result.profile.full_name }),
          ...(result.profile.username && { username: result.profile.username })
        }));

        Alert.alert('Success', 'Profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setIsModified(false);
      }

      // Change password if new password is provided
      if (newPassword) {
        if (!currentPassword) {
          Alert.alert('Error', 'Current password is required to change password');
          return;
        }
        await changePassword({ currentPassword, newPassword });
        Alert.alert('Success', 'Password changed successfully');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      if (error.code === 'username_taken') {
        Alert.alert('Error', 'This username is already taken. Please choose another.');
      } else {
        Alert.alert('Error', error.message || 'Failed to update profile');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </Pressable>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
      <Text style={styles.title}>NAME</Text>
      <TextInput 
        style={styles.input} 
        value={fullName} 
        onChangeText={(text) => {
          setFullName(text);
          setIsModified(true);
        }} 
      />
      <Text style={styles.title}>USERNAME</Text>
      <TextInput 
        style={styles.input} 
        value={username} 
        onChangeText={(text) => {
          setUsername(text);
          setIsModified(true);
        }} 
      />
      <Text style={styles.title}>EMAIL</Text>
      <TextInput 
        style={[styles.input, styles.disabledInput]} 
        value={email} 
        editable={false} 
      />
      <Text style={styles.title}>Current Password</Text>
      <TextInput 
        style={styles.input} 
        secureTextEntry 
        placeholder="Current password" 
        value={currentPassword}
        onChangeText={(text) => {
          setCurrentPassword(text);
          setIsModified(true);
        }} 
      />
      <Text style={styles.title}>New Password</Text>
      <TextInput 
        style={styles.input} 
        secureTextEntry 
        placeholder="Type new password" 
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          setIsModified(true);
        }} 
      />
            <LinearGradient 
              colors={['#D2691E', '#8B4513']} 
              style={styles.ctaButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Pressable 
                style={[
                  styles.ctaInner,
                  (!isModified || (newPassword !== '' && !currentPassword)) && { opacity: 0.5 }
                ]} 
                onPress={handleSave}
                disabled={!isModified || (newPassword !== '' && !currentPassword)}
              >
                <Text style={styles.ctaText}>Save Changes</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FAEAB1' 
  },
  container: { 
    flex: 1, 
    padding: 20 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#8B4513',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  title: { 
    fontWeight: '800', 
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 8,
  },
  input: { 
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 4,
  },
  disabledInput: { 
    backgroundColor: '#f3f4f6', 
    color: '#6b7280' 
  },
  ctaButton: {
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#D2691E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
});


