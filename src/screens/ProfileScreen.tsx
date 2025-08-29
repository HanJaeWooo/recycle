import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import HeaderBar from '@/components/HeaderBar';
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
          Alert.alert(
            'Authentication Error', 
            'You are not logged in. Please sign in again.',
            [{ 
              text: 'Sign In', 
              onPress: () => navigation.navigate('SignIn' as never) 
            }]
          );
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
    <View style={styles.container}>
      <HeaderBar title="" />
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
      <Pressable 
        style={[
          styles.save, 
          (!isModified || (newPassword && !currentPassword)) && styles.disabledSave
        ]} 
        onPress={handleSave}
        disabled={!isModified || (newPassword && !currentPassword)}
      >
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  title: { fontWeight: '800', marginTop: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: radii.pill },
  disabledInput: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  save: { marginTop: 12, backgroundColor: colors.bg, alignItems: 'center', paddingVertical: 12, borderRadius: radii.pill },
  disabledSave: { backgroundColor: '#e5e7eb', opacity: 0.5 },
  saveText: { fontWeight: '700' },
});


