import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FullScreenWrapperProps = {
  children: React.ReactNode;
  backgroundColor?: string;
  noStatusBar?: boolean;
};

export default function FullScreenWrapper({ 
  children, 
  backgroundColor = '#FAEAB1',
  noStatusBar = false
}: FullScreenWrapperProps) {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {!noStatusBar && <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />}
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={[styles.content, { paddingTop: noStatusBar ? 0 : statusBarHeight }]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});