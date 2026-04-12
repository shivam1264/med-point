import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCard } from '../../components/AlertCard';
import { BedCapacityBar } from '../../components/BedCapacityBar';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockCases, mockHospitals } from '../../constants/mockData';
import { Typography } from '../../constants/typography';

const jp = mockHospitals.find(h => h.id === 'h1')!;

export function HospitalAdminScreen() {
  const [loading, setLoading] = useState(true);
  const [icuFree, setIcuFree] = useState(jp.icuFree);
  const [generalFree, setGeneralFree] = useState(jp.generalFree);
  const [otFree, setOtFree] = useState(jp.otFree);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const incoming = useMemo(
    () => mockCases.filter(c => c.assignedHospital === Labels.defaultHospitalName),
    [],
  );

  const icuUsed = jp.icuTotal - icuFree;
  const genUsed = jp.generalTotal - generalFree;
  const otUsed = jp.otTotal - otFree;

  const bump = (
    type: 'icu' | 'gen' | 'ot',
    delta: number,
  ) => {
    if (type === 'icu') {
      setIcuFree(f => Math.max(0, Math.min(jp.icuTotal, f + delta)));
    } else if (type === 'gen') {
      setGeneralFree(f => Math.max(0, Math.min(jp.generalTotal, f + delta)));
    } else {
      setOtFree(f => Math.max(0, Math.min(jp.otTotal, f + delta)));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.danger} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>{Labels.hospitalAdminTitle}</Text>

        <Text style={styles.section}>{Labels.updateCapacity}</Text>
        <View style={styles.card}>
          <BedCapacityBar label="ICU" used={icuUsed} total={jp.icuTotal} />
          <View style={styles.btnRow}>
            <Pressable style={styles.smallBtn} onPress={() => bump('icu', 1)}>
              <Text style={styles.smallBtnText}>{Labels.freeUp}</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => bump('icu', -1)}>
              <Text style={styles.smallBtnText}>{Labels.occupy}</Text>
            </Pressable>
          </View>
          <BedCapacityBar label="General" used={genUsed} total={jp.generalTotal} />
          <View style={styles.btnRow}>
            <Pressable style={styles.smallBtn} onPress={() => bump('gen', 1)}>
              <Text style={styles.smallBtnText}>{Labels.freeUp}</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => bump('gen', -1)}>
              <Text style={styles.smallBtnText}>{Labels.occupy}</Text>
            </Pressable>
          </View>
          <BedCapacityBar label="OT" used={otUsed} total={jp.otTotal} />
          <View style={styles.btnRow}>
            <Pressable style={styles.smallBtn} onPress={() => bump('ot', 1)}>
              <Text style={styles.smallBtnText}>{Labels.freeUp}</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => bump('ot', -1)}>
              <Text style={styles.smallBtnText}>{Labels.occupy}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.section}>{Labels.incomingPatients}</Text>
        {incoming.length === 0 ? (
          <Text style={styles.empty}>{Labels.noData}</Text>
        ) : (
          incoming.map(c => (
            <AlertCard
              key={c.id}
              type={c.severity === 'critical' ? 'critical' : 'warning'}
              message={`${c.id} — ${c.type}`}
              time={c.eta}
            />
          ))
        )}

        <Text style={styles.section}>{Labels.onCallSpecialists}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {jp.specialists.map(s => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
          <Pressable
            style={styles.chip}
            onPress={() => Alert.alert(Labels.addSpecialist, Labels.featureComingSoon)}>
            <Text style={styles.chipText}>{Labels.addSpecialist}</Text>
          </Pressable>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { ...Typography.h1, color: Colors.textPrimary, marginBottom: 12 },
  section: { ...Typography.h3, color: Colors.textPrimary, marginTop: 8, marginBottom: 8 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    elevation: 2,
  },
  btnRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
  },
  smallBtnText: { ...Typography.small, color: Colors.textPrimary },
  empty: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center', marginVertical: 12 },
  chipsScroll: { flexGrow: 0, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginRight: 8,
  },
  chipText: { ...Typography.small, color: Colors.textPrimary },
});
