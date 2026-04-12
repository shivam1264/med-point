import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export type StatusPillType =
  | 'critical'
  | 'serious'
  | 'moderate'
  | 'admitted'
  | 'info'
  | 'success';

const typeStyles: Record<
  StatusPillType,
  { bg: string; text: string }
> = {
  critical: { bg: Colors.dangerLight, text: Colors.dangerDark },
  serious: { bg: Colors.warningLight, text: Colors.warningDark },
  moderate: { bg: Colors.grayLight, text: Colors.grayDark },
  admitted: { bg: Colors.successLight, text: Colors.successDark },
  info: { bg: Colors.infoLight, text: Colors.infoDark },
  success: { bg: Colors.successLight, text: Colors.successDark },
};

export function StatusPill({ label, type }: { label: string; type: StatusPillType }) {
  const s = typeStyles[type];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: { ...Typography.small, fontWeight: '500' },
});
