import { Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export const stackScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  headerShadowVisible: false,
};

export const tabScreenOptions = {
  tabBarStyle: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textTertiary,
  tabBarLabelStyle: { 
    fontSize: 11, 
    fontWeight: '700',
    marginBottom: Platform.OS === 'ios' ? 0 : 6,
  },
  tabBarIconStyle: {
    marginTop: 2,
  },
};




