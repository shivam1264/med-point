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
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { ...Typography.small, color: Colors.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { ...Typography.h1, marginTop: 4, fontWeight: '900' },
});

