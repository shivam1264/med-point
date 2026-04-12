import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Labels } from '../constants/labels';
import { HospitalAdminScreen } from '../screens/hospital/HospitalAdminScreen';
import { HospitalIncomingScreen } from '../screens/hospital/HospitalIncomingScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { tabScreenOptions } from './headerStyles';
import type { HospitalTabParamList } from './types';

const Tab = createBottomTabNavigator<HospitalTabParamList>();

export function HospitalTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...tabScreenOptions, headerShown: false }}>
      <Tab.Screen
        name="Beds"
        component={HospitalAdminScreen}
        options={{
          tabBarLabel: Labels.beds,
          tabBarIcon: ({ color, size }) => <Icon name="bed" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Incoming"
        component={HospitalIncomingScreen}
        options={{
          tabBarLabel: Labels.incoming,
          tabBarIcon: ({ color, size }) => <Icon name="ambulance" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: Labels.settings,
          tabBarIcon: ({ color, size }) => <Icon name="cog" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
