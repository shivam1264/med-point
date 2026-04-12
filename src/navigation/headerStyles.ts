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
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  tabBarActiveTintColor: Colors.danger,
  tabBarInactiveTintColor: Colors.textTertiary,
  tabBarLabelStyle: { fontSize: 10 },
};
