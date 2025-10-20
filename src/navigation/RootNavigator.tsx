import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import OnboardingScreen from '@/screens/Onboarding/OnboardingScreen';
import SignInScreen from '@/screens/Auth/SignInScreen';
import SignUpScreen from '@/screens/Auth/SignUpScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import Tabs from '@/navigation/Tabs';
import LandingScreen from '@/screens/LandingScreen';
import IdeaDetailScreen from '@/screens/IdeaDetailScreen';
import GuidesScreen from '@/screens/GuidesScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import MaterialGuideScreen from '@/screens/MaterialGuideScreen';
import AllMaterialsScreen from '@/screens/AllMaterialsScreen';
import YouTubeVideoListScreen from '@/screens/YouTubeVideoListScreen';
import ProjectHistoryScreen from '@/screens/ProjectHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  console.log('🚀 Navigation: Starting with Landing screen');

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Landing"
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Main" component={Tabs} />

      {/* Other app pages */}
      <Stack.Screen name="IdeaDetail" component={IdeaDetailScreen} />
      <Stack.Screen name="Guides" component={GuidesScreen} />
      <Stack.Screen name="MaterialGuide" component={MaterialGuideScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AllMaterials" component={AllMaterialsScreen} />
      
      {/* YouTube Video List screen */}
      <Stack.Screen name="YouTubeVideoList" component={YouTubeVideoListScreen} />
      
      {/* Project History screen */}
      <Stack.Screen name="ProjectHistory" component={ProjectHistoryScreen} />
    </Stack.Navigator>
  );
}
