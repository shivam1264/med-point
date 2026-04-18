import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Labels } from '../constants/labels';
import { HomeScreen } from '../screens/family/HomeScreen';
import { MapScreen } from '../screens/family/MapScreen';
import { HospitalScreen } from '../screens/family/HospitalScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { tabScreenOptions } from './headerStyles';
import type { FamilyTabParamList } from './types';

const Tab = createBottomTabNavigator<FamilyTabParamList>();

export function FamilyTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...tabScreenOptions, headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Family',
          tabBarIcon: ({ color, size }) => <Icon name="home-heart" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Locator',
          tabBarIcon: ({ color, size }) => <Icon name="map-search" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Hospital"
        component={HospitalScreen}
        options={{
          tabBarLabel: 'Hospitals',
          tabBarIcon: ({ color, size }) => <Icon name="hospital-marker" size={size + 2} color={color} />,
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
