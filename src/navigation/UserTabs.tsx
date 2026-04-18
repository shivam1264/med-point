import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserHomeScreen } from '../screens/user/UserHomeScreen';
import { NearbyHospitalsScreen } from '../screens/user/NearbyHospitalsScreen';
import { DoctorScreen } from '../screens/user/DoctorScreen';
import { UserMapScreen } from '../screens/user/UserMapScreen';

import { UserEmergencyTrackScreen } from '../screens/user/UserEmergencyTrackScreen';
import { UserProfileScreen } from '../screens/user/UserProfileScreen';
import { HistoryScreen } from '../screens/user/HistoryScreen';


export type UserTabParamList = {
  Home: undefined;
  Hospitals: undefined;
  Doctors: undefined;
  Profile: undefined;
  History: undefined;
};


export type UserStackParamList = {
  UserTabs: undefined;
  UserMap: { hospital: any; userLat?: number; userLng?: number };
  UserEmergencyTrack: { emergencyId: string };
  History: undefined;
};


const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createStackNavigator<UserStackParamList>();

import { tabScreenOptions } from './headerStyles';

function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        ...tabScreenOptions,
      }}>
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ color, size }) => <Icon name="shield-plus" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Hospitals"
        component={NearbyHospitalsScreen}
        options={{
          tabBarLabel: 'Hospitals',
          tabBarIcon: ({ color, size }) => <Icon name="hospital-marker" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Doctors"
        component={DoctorScreen}
        options={{
          tabBarLabel: 'Doctors',
          tabBarIcon: ({ color, size }) => <Icon name="stethoscope" size={size + 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon name="account-circle-outline" size={size + 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}


export function UserTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabNavigator} />
      <Stack.Screen name="UserMap" component={UserMapScreen} />
      <Stack.Screen name="UserEmergencyTrack" component={UserEmergencyTrackScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>

  );
}
