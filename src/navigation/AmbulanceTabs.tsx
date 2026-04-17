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

const tabBarStyle = {
  backgroundColor: '#111',
  borderTopColor: '#222',
  paddingBottom: 4,
  height: 60,
};

function AmbulanceTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#C0392B',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tab.Screen
        name="Home"
        component={AmbulanceHomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AmbulanceProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="account" size={size} color={color} />,
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
