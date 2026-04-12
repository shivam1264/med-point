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
          tabBarLabel: Labels.home,
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={HospitalMapScreen}
        options={{
          tabBarLabel: Labels.map,
          tabBarIcon: ({ color, size }) => <Icon name="map-marker" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cases"
        component={CaseListScreen}
        options={{
          tabBarLabel: Labels.cases,
          tabBarIcon: ({ color, size }) => <Icon name="clipboard-list" size={size} color={color} />,
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
