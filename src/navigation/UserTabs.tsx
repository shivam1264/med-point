import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserHomeScreen } from '../screens/user/UserHomeScreen';
import { NearbyHospitalsScreen } from '../screens/user/NearbyHospitalsScreen';
import { DoctorScreen } from '../screens/user/DoctorScreen';
import { UserMapScreen } from '../screens/user/UserMapScreen';

export type UserTabParamList = {
  Home: undefined;
  Hospitals: undefined;
  Doctors: undefined;
};

export type UserStackParamList = {
  UserTabs: undefined;
  UserMap: { hospital: any; userLat?: number; userLng?: number };
};

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createStackNavigator<UserStackParamList>();

const tabBarStyle = {
  backgroundColor: '#111',
  borderTopColor: '#222',
  paddingBottom: 4,
  height: 60,
};

function UserTabNavigator() {
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      requestGlobalLocationPermission();
    }
  }, []);

  const requestGlobalLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'MedFlow needs location access to find nearby hospitals and dispatch ambulances.',
          buttonPositive: 'OK',
        },
      );
    } catch (err) {
      console.warn(err);
    }
  };

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
        component={UserHomeScreen}
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ color, size }) => <Icon name="alarm-light" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Hospitals"
        component={NearbyHospitalsScreen}
        options={{
          tabBarLabel: 'Hospitals',
          tabBarIcon: ({ color, size }) => <Icon name="hospital-building" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Doctors"
        component={DoctorScreen}
        options={{
          tabBarLabel: 'Doctors',
          tabBarIcon: ({ color, size }) => <Icon name="doctor" size={size} color={color} />,
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
    </Stack.Navigator>
  );
}
