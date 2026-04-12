import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AlertType } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

const typeMap: Record<
  AlertType,
  { border: string; bg: string; text: string }
> = {
  critical: {
    border: Colors.danger,
    bg: Colors.dangerLight,
    text: Colors.dangerDark,
  },
  warning: {
    border: Colors.warning,
    bg: Colors.warningLight,
    text: Colors.warningDark,
  },
  info: {
    border: Colors.info,
    bg: Colors.infoLight,
    text: Colors.infoDark,
  },
  success: {
    border: Colors.success,
    bg: Colors.successLight,
    text: Colors.successDark,
  },
};

export function AlertCard({
  type,
  message,
  time,
}: {
  type: AlertType;
  message: string;
  time: string;
}) {
  const m = typeMap[type];
  return (
    <View style={[styles.card, { borderLeftColor: m.border, backgroundColor: m.bg }]}>
      <Text style={[styles.message, { color: m.text }]}>{message}</Text>
      <Text style={[styles.time, { color: Colors.textTertiary }]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  message: { ...Typography.body },
  time: { ...Typography.tiny, marginTop: 4 },
});
