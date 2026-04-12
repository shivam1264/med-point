import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CaseItem } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { StatusPill } from './StatusPill';

export function CaseRow({ item, onPress }: { item: CaseItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.top}>
        <Text style={styles.id}>{item.id}</Text>
        <StatusPill label={item.severity} type={item.severity} />
      </View>
      <Text style={styles.type} numberOfLines={2}>
        {item.type}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{item.ambulanceId}</Text>
        <Text style={styles.metaText}>·</Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {item.assignedHospital}
        </Text>
      </View>
      <View style={styles.etaPill}>
        <Text style={styles.etaText}>{item.eta}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    elevation: 2,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { ...Typography.h3, color: Colors.textPrimary },
  type: { ...Typography.body, color: Colors.textSecondary, marginTop: 6 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  metaText: { ...Typography.small, color: Colors.textTertiary },
  etaPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  etaText: { ...Typography.small, color: Colors.dangerDark, fontWeight: '500' },
});
