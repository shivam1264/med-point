import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export function MetricCard({
  label,
  value,
  colorType,
}: {
  label: string;
  value: string | number;
  colorType: 'danger' | 'success' | 'normal';
}) {
  const valueColor =
    colorType === 'danger'
      ? Colors.danger
      : colorType === 'success'
        ? Colors.success
        : Colors.textPrimary;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    elevation: 2,
  },
  label: { ...Typography.small, color: Colors.textSecondary },
  value: { ...Typography.h1, marginTop: 4 },
});
