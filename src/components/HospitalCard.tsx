import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Hospital, HospitalStatus } from '../types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { BedCapacityBar } from './BedCapacityBar';

function statusDotColor(status: HospitalStatus) {
  if (status === 'full') {
    return Colors.danger;
  }
  if (status === 'moderate') {
    return Colors.warning;
  }
  return Colors.success;
}

export function HospitalCard({
  hospital,
  onPress,
}: {
  hospital: Hospital;
  onPress?: () => void;
}) {
  const icuUsed = hospital.icuTotal - hospital.icuFree;
  const genUsed = hospital.generalTotal - hospital.generalFree;
  const otUsed = hospital.otTotal - hospital.otFree;

  const content = (
    <>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: statusDotColor(hospital.status) }]} />
        <Text style={styles.name}>{hospital.name}</Text>
        <View style={styles.distance}>
          <Text style={styles.distanceText}>{hospital.distance}</Text>
        </View>
      </View>
      <BedCapacityBar label="ICU" used={icuUsed} total={hospital.icuTotal} />
      <BedCapacityBar label="General" used={genUsed} total={hospital.generalTotal} />
      <BedCapacityBar label="OT" used={otUsed} total={hospital.otTotal} />
      <Text style={styles.specs} numberOfLines={2}>
        {hospital.specialists.join(' · ')}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { ...Typography.h3, color: Colors.textPrimary, flex: 1 },
  distance: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  distanceText: { ...Typography.tiny, color: Colors.textSecondary },
  specs: { ...Typography.small, color: Colors.textTertiary, marginTop: 4 },
});
