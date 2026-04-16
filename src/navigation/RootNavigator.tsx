import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AmbulanceTabs } from './AmbulanceTabs';
import { FamilyTabs } from './FamilyTabs';
import { stackScreenOptions } from './headerStyles';
import type { RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
  },
};

export function RootNavigator() {
  const { isLoggedIn, role } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        key={isLoggedIn && role ? `${role}-in` : 'auth'}
        screenOptions={{ headerShown: false }}>
        {!isLoggedIn || !role ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : role === 'ambulance' ? (
          <RootStack.Screen name="AmbulanceFlow" component={AmbulanceTabs} />
        ) : (
          <RootStack.Screen name="FamilyFlow" component={FamilyTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
