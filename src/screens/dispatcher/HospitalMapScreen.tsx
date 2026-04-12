import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HospitalCard } from '../../components/HospitalCard';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockHospitals } from '../../constants/mockData';
import { Typography } from '../../constants/typography';
import type { HospitalStatus } from '../../types';
function markerColor(status: HospitalStatus) {
  if (status === 'full') {
    return Colors.danger;
  }
  if (status === 'moderate') {
    return Colors.warning;
  }
  return Colors.success;
}

export function HospitalMapScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

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
      <Text style={styles.screenTitle}>{Labels.map}</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 23.2599,
          longitude: 77.4126,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}>
        {mockHospitals.map(h => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.lat, longitude: h.lng }}
            tracksViewChanges={false}>
            <View style={[styles.markerDot, { backgroundColor: markerColor(h.status) }]} />
            <Callout
              onPress={() =>
                Alert.alert(h.name, `${h.address}\nICU free: ${h.icuFree}`)
              }>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{h.name}</Text>
                <Text style={styles.calloutSub}>ICU free: {h.icuFree}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <LegendDot color={Colors.danger} label="Full" />
        <LegendDot color={Colors.warning} label="Moderate" />
        <LegendDot color={Colors.success} label="Available" />
        <LegendDot color={Colors.info} label="Ambulance" />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {mockHospitals.length === 0 ? (
          <Text style={styles.empty}>{Labels.noData}</Text>
        ) : (
          mockHospitals.map(h => (
            <HospitalCard
              key={h.id}
              hospital={h}
              onPress={() =>
                Alert.alert(
                  h.name,
                  `${h.address}\nICU free: ${h.icuFree} · OT free: ${h.otFree}\n${h.distance}`,
                )
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { ...Typography.h1, color: Colors.textPrimary, paddingHorizontal: 16, marginBottom: 8 },
  map: { height: 220, width: '100%' },
  markerDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.white },
  callout: { padding: 8, maxWidth: 200 },
  calloutTitle: { ...Typography.h3, color: Colors.textPrimary },
  calloutSub: { ...Typography.small, color: Colors.textSecondary, marginTop: 4 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    alignItems: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { ...Typography.tiny, color: Colors.textSecondary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center', marginTop: 24 },
});
