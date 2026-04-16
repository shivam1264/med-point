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
          tabBarLabel: Labels.home,
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: Labels.map,
          tabBarIcon: ({ color, size }) => <Icon name="map-marker" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Hospital"
        component={HospitalScreen}
        options={{
          tabBarLabel: 'Hospitals',
          tabBarIcon: ({ color, size }) => <Icon name="hospital" size={size} color={color} />,
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
