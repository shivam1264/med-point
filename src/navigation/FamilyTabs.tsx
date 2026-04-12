import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Labels } from '../constants/labels';
import { FamilyTrackingScreen } from '../screens/family/FamilyTrackingScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { tabScreenOptions } from './headerStyles';
import type { FamilyTabParamList } from './types';

const Tab = createBottomTabNavigator<FamilyTabParamList>();

export function FamilyTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...tabScreenOptions, headerShown: false }}>
      <Tab.Screen
        name="Track"
        component={FamilyTrackingScreen}
        options={{
          tabBarLabel: Labels.track,
          tabBarIcon: ({ color, size }) => <Icon name="heart-pulse" size={size} color={color} />,
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
