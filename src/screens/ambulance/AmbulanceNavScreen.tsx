import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Emergency } from '../../types';

interface Props {
  route: { params: { emergency: Emergency } };
  navigation: any;
}

export function AmbulanceNavScreen({ route, navigation }: Props) {
  const { emergency } = route.params;
  const patLat = emergency.location?.lat ?? 23.25;
  const patLng = emergency.location?.lng ?? 77.41;
  const hospLat = emergency.hospitalLat ?? 23.21;
  const hospLng = emergency.hospitalLng ?? 77.44;

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={22} color="#fff" />
      </TouchableOpacity>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        initialRegion={{ latitude: patLat, longitude: patLng, latitudeDelta: 0.06, longitudeDelta: 0.06 }}>
        <Marker coordinate={{ latitude: patLat, longitude: patLng }} title="Patient">
          <View style={styles.patientMarker}><Icon name="account" size={20} color="#fff" /></View>
        </Marker>
        <Marker coordinate={{ latitude: hospLat, longitude: hospLng }} title={emergency.hospitalName || 'Hospital'}>
          <View style={styles.hospMarker}><Icon name="hospital-building" size={20} color="#fff" /></View>
        </Marker>
        <Polyline
          coordinates={[{ latitude: patLat, longitude: patLng }, { latitude: hospLat, longitude: hospLng }]}
          strokeColor="#C0392B" strokeWidth={3} lineDashPattern={[8, 4]} />
      </MapView>

      <View style={styles.infoCard}>
        <View style={styles.phase}>
          <View style={[styles.phaseStep, styles.phaseActive]}><Text style={styles.phaseStepText}>1</Text></View>
          <Text style={styles.phaseLabel}>Reach Patient</Text>
          <View style={styles.phaseLine} />
          <View style={styles.phaseStep}><Text style={styles.phaseStepText}>2</Text></View>
          <Text style={styles.phaseLabel}>To Hospital</Text>
        </View>
        {emergency.hospitalName && (
          <View style={styles.row}><Icon name="hospital-building" size={16} color="#888" /><Text style={styles.rowText}>{emergency.hospitalName}</Text></View>
        )}
        {emergency.hospitalAddress && (
          <View style={styles.row}><Icon name="map-marker" size={16} color="#888" /><Text style={styles.rowText}>{emergency.hospitalAddress}</Text></View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center'
  },
  patientMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F39C12', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  hospMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C0392B', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  infoCard: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  phase: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 },
  phaseStep: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  phaseActive: { backgroundColor: '#C0392B' },
  phaseStepText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  phaseLabel: { fontSize: 13, color: '#888', marginRight: 6 },
  phaseLine: { flex: 1, height: 2, backgroundColor: '#2A2A2A' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowText: { flex: 1, fontSize: 13, color: '#ccc' },
});
