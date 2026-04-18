import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AmbulanceHomeScreen } from '../screens/ambulance/AmbulanceHomeScreen';
import { AmbulanceNavScreen } from '../screens/ambulance/AmbulanceNavScreen';
import { AmbulanceProfileScreen } from '../screens/ambulance/AmbulanceProfileScreen';

export type AmbTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type AmbStackParamList = {
  AmbTabs: undefined;
  AmbulanceNav: { emergency: any };
};

const Tab = createBottomTabNavigator<AmbTabParamList>();
const Stack = createStackNavigator<AmbStackParamList>();

import { tabScreenOptions } from './headerStyles';

function AmbulanceTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        ...tabScreenOptions,
      }}>
      <Tab.Screen
        name="Home"
        component={AmbulanceHomeScreen}
        options={{
          tabBarLabel: 'Fleet',
          tabBarIcon: ({ color, size }) => <Icon name="view-dashboard-outline" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AmbulanceProfileScreen}
        options={{
          tabBarLabel: 'Operator',
          tabBarIcon: ({ color, size }) => <Icon name="account-group-outline" size={size + 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}


export function AmbulanceTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AmbTabs" component={AmbulanceTabNavigator} />
      <Stack.Screen name="AmbulanceNav" component={AmbulanceNavScreen} />
    </Stack.Navigator>
  );
}
