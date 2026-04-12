import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CaseDetailScreen } from '../screens/dispatcher/CaseDetailScreen';
import { AmbulanceTabs } from './AmbulanceTabs';
import { DispatcherTabs } from './DispatcherTabs';
import { FamilyTabs } from './FamilyTabs';
import { HospitalTabs } from './HospitalTabs';
import { stackScreenOptions } from './headerStyles';
import type { DispatcherStackParamList, RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();
const DispatcherStack = createStackNavigator<DispatcherStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
  },
};

function DispatcherFlow() {
  return (
    <DispatcherStack.Navigator screenOptions={stackScreenOptions}>
      <DispatcherStack.Screen
        name="DispatcherTabs"
        component={DispatcherTabs}
        options={{ headerShown: false }}
      />
      <DispatcherStack.Screen
        name="CaseDetail"
        component={CaseDetailScreen}
        options={({ route }) => ({
          title: route.params.caseId,
        })}
      />
    </DispatcherStack.Navigator>
  );
}

export function RootNavigator() {
  const { isLoggedIn, role } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        key={isLoggedIn && role ? `${role}-in` : 'auth'}
        screenOptions={{ headerShown: false }}>
        {!isLoggedIn || !role ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : role === 'dispatcher' ? (
          <RootStack.Screen name="DispatcherFlow" component={DispatcherFlow} />
        ) : role === 'ambulance' ? (
          <RootStack.Screen name="AmbulanceFlow" component={AmbulanceTabs} />
        ) : role === 'hospital' ? (
          <RootStack.Screen name="HospitalFlow" component={HospitalTabs} />
        ) : (
          <RootStack.Screen name="FamilyFlow" component={FamilyTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
