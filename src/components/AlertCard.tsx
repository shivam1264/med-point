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
    borderLeftWidth: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  message: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  time: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, marginTop: 6, textTransform: 'uppercase' },
});

