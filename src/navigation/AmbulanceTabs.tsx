import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AmbulanceHomeScreen } from '../screens/ambulance/AmbulanceHomeScreen';
import { AmbulanceNavScreen } from '../screens/ambulance/AmbulanceNavScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
        name="AmbHome"
        component={AmbulanceHomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon name="ambulance" size={size} color={color} />,
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
