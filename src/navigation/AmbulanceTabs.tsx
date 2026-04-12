import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Labels } from '../constants/labels';
import { AmbulanceNavScreen } from '../screens/ambulance/AmbulanceNavScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { tabScreenOptions } from './headerStyles';
import type { AmbulanceTabParamList } from './types';

const Tab = createBottomTabNavigator<AmbulanceTabParamList>();

export function AmbulanceTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...tabScreenOptions, headerShown: false }}>
      <Tab.Screen
        name="Navigate"
        component={AmbulanceNavScreen}
        options={{
          tabBarLabel: Labels.navigate,
          tabBarIcon: ({ color, size }) => <Icon name="navigation" size={size} color={color} />,
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
