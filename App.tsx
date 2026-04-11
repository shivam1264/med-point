/**
 * MedFlow v1 - Healthcare Management Mobile Application
 * https://medflow.app
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, ScrollView } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      <AppContent isDarkMode={isDarkMode} />
    </SafeAreaProvider>
  );
}

function AppContent({ isDarkMode }: { isDarkMode: boolean }) {
  const safeAreaInsets = useSafeAreaInsets();
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const accentColor = '#007AFF';

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor, paddingTop: safeAreaInsets.top }
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.header}>
        <Text style={[styles.appName, { color: accentColor }]}>
          MedFlow v1
        </Text>
        <Text style={[styles.tagline, { color: textColor }]}>
          Healthcare Management System
        </Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={[styles.statusTitle, { color: textColor }]}>
          App Status
        </Text>
        <View style={[styles.statusBox, { borderColor: accentColor }]}>
          <Text style={[styles.statusText, { color: textColor }]}>
            ✓ Development Environment Ready
          </Text>
          <Text style={[styles.statusSubtext, { color: textColor }]}>
            Connected via USB to device
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: textColor }]}>
          Quick Info
        </Text>
        <View style={[styles.infoItem, { borderBottomColor: isDarkMode ? '#333' : '#ddd' }]}>
          <Text style={[styles.infoLabel, { color: textColor }]}>Version:</Text>
          <Text style={[styles.infoValue, { color: accentColor }]}>1.0.0</Text>
        </View>
        <View style={[styles.infoItem, { borderBottomColor: isDarkMode ? '#333' : '#ddd' }]}>
          <Text style={[styles.infoLabel, { color: textColor }]}>Framework:</Text>
          <Text style={[styles.infoValue, { color: accentColor }]}>React Native 0.85.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: textColor }]}>Status:</Text>
          <Text style={[styles.infoValue, { color: '#4CAF50' }]}>Active</Text>
        </View>
      </View>

      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.8,
  },
  statusBox: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default App;
