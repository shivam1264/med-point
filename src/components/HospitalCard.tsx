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
    backgroundColor: Colors.white,
    borderRadius: 16,
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  name: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, flex: 1 },
  distance: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  distanceText: { fontSize: 11, fontWeight: '900', color: Colors.primary },
  specs: { fontSize: 13, color: Colors.textTertiary, marginTop: 12, fontWeight: '600' },
});

