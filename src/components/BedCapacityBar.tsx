import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export function BedCapacityBar({
  label,
  used,
  total,
}: {
  label: string;
  used: number;
  total: number;
}) {
  const pct = total > 0 ? used / total : 0;
  const barColor = useMemo(() => {
    if (pct > 0.8) {
      return Colors.danger;
    }
    if (pct > 0.5) {
      return Colors.warning;
    }
    return Colors.success;
  }, [pct]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>
          {used}/{total}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { ...Typography.body, color: Colors.textPrimary },
  count: { ...Typography.small, color: Colors.textSecondary },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grayLight,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});
