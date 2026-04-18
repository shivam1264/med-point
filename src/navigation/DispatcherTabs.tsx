import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Labels } from '../constants/labels';
import { DispatcherHomeScreen } from '../screens/dispatcher/DispatcherHomeScreen';
import { HospitalMapScreen } from '../screens/dispatcher/HospitalMapScreen';
import { CaseListScreen } from '../screens/dispatcher/CaseListScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { tabScreenOptions } from './headerStyles';
import type { DispatcherTabParamList } from './types';

const Tab = createBottomTabNavigator<DispatcherTabParamList>();

export function DispatcherTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...tabScreenOptions, headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={DispatcherHomeScreen}
        options={{
          tabBarLabel: 'Fleet',
          tabBarIcon: ({ color, size }) => <Icon name="shield-car" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={HospitalMapScreen}
        options={{
          tabBarLabel: 'Radar',
          tabBarIcon: ({ color, size }) => <Icon name="map-marker-radius" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cases"
        component={CaseListScreen}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color, size }) => <Icon name="clipboard-pulse-outline" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Icon name="cog-outline" size={size + 2} color={color} />,
        }}
      />
    </Tab.Navigator>

  );
}
