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
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VitalsGrid } from '../../components/VitalsGrid';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockCases } from '../../constants/mockData';
import { Typography } from '../../constants/typography';
import type { Vitals } from '../../types';

const JP = { latitude: 23.2599, longitude: 77.4126 };
const CURRENT = { latitude: 23.25, longitude: 77.42 };

type VitalKey = keyof Vitals;

export function AmbulanceNavScreen() {
  const base = mockCases[0].vitals;
  const [loading, setLoading] = useState(true);
  const [arrived, setArrived] = useState(false);
  const [strings, setStrings] = useState<Record<VitalKey, string>>({
    hr: String(base.hr),
    bp: base.bp,
    spo2: String(base.spo2),
    gcs: String(base.gcs),
  });

  const vitals: Vitals = useMemo(
    () => ({
      hr: parseInt(strings.hr, 10) || 0,
      bp: strings.bp,
      spo2: parseInt(strings.spo2, 10) || 0,
      gcs: parseInt(strings.gcs, 10) || 0,
    }),
    [strings],
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const onVitalChange = (key: VitalKey, value: string) => {
    setStrings(s => ({ ...s, [key]: value }));
  };

  const onArrived = () => {
    Alert.alert(Labels.arrivedTitle, Labels.arrivedMessage, [
      { text: Labels.cancel, style: 'cancel' },
      {
        text: Labels.ok,
        onPress: () => setArrived(true),
      },
    ]);
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
        <View style={styles.header}>
          <Text style={styles.title}>{Labels.navigation}</Text>
          <View style={styles.etaBadge}>
            <Text style={styles.etaText}>{Labels.navEtaBadge}</Text>
          </View>
        </View>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 23.255,
            longitude: 77.415,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}>
          <Marker coordinate={CURRENT} title="Current" tracksViewChanges={false}>
            <View style={[styles.marker, { backgroundColor: Colors.info }]} />
          </Marker>
          <Marker coordinate={JP} title="JP Hospital" tracksViewChanges={false}>
            <View style={[styles.marker, { backgroundColor: Colors.danger }]} />
          </Marker>
        </MapView>

        <View style={styles.preNote}>
          <Text style={styles.preNoteText}>
            {Labels.preNotificationTitle} · {Labels.specialistReady}
          </Text>
        </View>

        <Text style={styles.section}>{Labels.patientVitalsInput}</Text>
        <VitalsGrid
          vitals={vitals}
          editable
          stringValues={strings}
          onStringChange={onVitalChange}
        />

        <Pressable
          style={[styles.arrivedBtn, arrived && { opacity: 0.6 }]}
          onPress={onArrived}
          disabled={arrived}>
          <Text style={styles.arrivedText}>{Labels.arrivedAtHospital}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { ...Typography.h1, color: Colors.textPrimary },
  etaBadge: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  etaText: { ...Typography.small, color: Colors.dangerDark, fontWeight: '600' },
  map: { height: 180, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  marker: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: Colors.white },
  preNote: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
    padding: 12,
    marginBottom: 16,
  },
  preNoteText: { ...Typography.body, color: Colors.successDark },
  section: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 8 },
  arrivedBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  arrivedText: { ...Typography.h2, color: Colors.white },
});
