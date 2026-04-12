import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { Vitals } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

type VitalKey = keyof Vitals;

const LABELS: Record<VitalKey, string> = {
  hr: 'HR',
  bp: 'BP',
  spo2: 'SpO₂',
  gcs: 'GCS',
};

function parseForColors(v: Vitals): Vitals {
  return v;
}

function parseFromStrings(values: Record<VitalKey, string>): Vitals {
  return {
    hr: parseInt(values.hr, 10) || 0,
    bp: values.bp,
    spo2: parseInt(values.spo2, 10) || 0,
    gcs: parseInt(values.gcs, 10) || 0,
  };
}

export function VitalsGrid({
  vitals,
  editable = false,
  stringValues,
  onStringChange,
}: {
  vitals: Vitals;
  editable?: boolean;
  stringValues?: Record<VitalKey, string>;
  onStringChange?: (key: VitalKey, value: string) => void;
}) {
  const colorSource = useMemo(() => {
    if (editable && stringValues) {
      return parseFromStrings(stringValues);
    }
    return parseForColors(vitals);
  }, [editable, stringValues, vitals]);

  const hrColor = colorSource.hr > 100 ? Colors.danger : Colors.textPrimary;
  const spoColor = colorSource.spo2 < 95 ? Colors.warning : Colors.textPrimary;

  const cells: { key: VitalKey; color: string }[] = [
    { key: 'hr', color: hrColor },
    { key: 'bp', color: Colors.textPrimary },
    { key: 'spo2', color: spoColor },
    { key: 'gcs', color: Colors.textPrimary },
  ];

  return (
    <View style={styles.grid}>
      {cells.map(({ key, color }) => (
        <View key={key} style={styles.cell}>
          <Text style={styles.cellLabel}>{LABELS[key]}</Text>
          {editable && stringValues && onStringChange ? (
            <TextInput
              style={[styles.input, { color }]}
              value={stringValues[key]}
              onChangeText={t => onStringChange(key, t)}
              keyboardType={key === 'bp' ? 'default' : 'numeric'}
            />
          ) : (
            <Text style={[styles.value, { color }]}>{vitals[key]}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '48%',
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 10,
  },
  cellLabel: { ...Typography.tiny, color: Colors.textTertiary, marginBottom: 4 },
  value: { ...Typography.h2 },
  input: { ...Typography.h2, padding: 0, margin: 0, minHeight: 28 },
});
