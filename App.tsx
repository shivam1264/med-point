/**
 * MedRoute — emergency healthcare coordination (UI shell)
 *
 * @format
 */

import React from 'react';
import { LogBox, StatusBar } from 'react-native';

// React Navigation stack still touches InteractionManager; RN deprecates it upstream.
if (__DEV__) {
  LogBox.ignoreLogs(['InteractionManager has been deprecated']);
}
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/constants/colors';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

