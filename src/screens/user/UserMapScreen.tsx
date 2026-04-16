import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Hospital } from '../../types';

interface Props {
  route: { params: { hospital: Hospital; userLat?: number; userLng?: number } };
  navigation: any;
}

export function UserMapScreen({ route, navigation }: Props) {
  const { hospital, userLat, userLng } = route.params;
  const mapRef = useRef<MapView>(null);

  const hospLat = hospital.location?.coordinates?.[1] || hospital.coordinates?.lat || 23.2599;
  const hospLng = hospital.location?.coordinates?.[0] || hospital.coordinates?.lng || 77.4126;

  const hasUserLocation = userLat != null && userLng != null;

  useEffect(() => {
    if (mapRef.current && hasUserLocation) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          [
            { latitude: userLat!, longitude: userLng! },
            { latitude: hospLat, longitude: hospLng }
          ],
          { edgePadding: { top: 80, right: 40, bottom: 160, left: 40 }, animated: true }
        );
      }, 500);
    }
  }, []);

  const dist = hospital.distanceKm?.toFixed(1);
  const eta = hospital.distanceKm ? Math.round(hospital.distanceKm * 3) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={22} color="#fff" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: hospLat,
          longitude: hospLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={hasUserLocation}
        showsMyLocationButton={false}>

        {/* Hospital Marker */}
        <Marker
          coordinate={{ latitude: hospLat, longitude: hospLng }}
          title={hospital.hospitalName}
          description={hospital.address}>
          <View style={styles.hospitalMarker}>
            <Icon name="hospital-building" size={22} color="#fff" />
          </View>
        </Marker>

        {/* Route line if we have user location */}
        {hasUserLocation && (
          <Polyline
            coordinates={[
              { latitude: userLat!, longitude: userLng! },
              { latitude: hospLat, longitude: hospLng }
            ]}
            strokeColor="#C0392B"
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Bottom Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoIcon}>
            <Icon name="hospital-building" size={24} color="#C0392B" />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.hospName}>{hospital.hospitalName}</Text>
            <Text style={styles.hospAddress} numberOfLines={1}>{hospital.address}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {dist && (
            <View style={styles.statItem}>
              <Icon name="map-marker-distance" size={18} color="#C0392B" />
              <Text style={styles.statVal}>{dist} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          )}
          {eta && (
            <View style={styles.statItem}>
              <Icon name="clock-fast" size={18} color="#F39C12" />
              <Text style={styles.statVal}>~{eta} min</Text>
              <Text style={styles.statLabel}>ETA</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Icon name="bed" size={18} color="#27AE60" />
            <Text style={styles.statVal}>{hospital.icuAvailable ?? '?'}</Text>
            <Text style={styles.statLabel}>ICU Free</Text>
          </View>
          {hospital.phone && (
            <TouchableOpacity style={styles.statItem} onPress={() => Alert.alert('Call Hospital', hospital.phone)}>
              <Icon name="phone" size={18} color="#378ADD" />
              <Text style={styles.statVal}>Call</Text>
              <Text style={styles.statLabel}>Hospital</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center'
  },
  hospitalMarker: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff'
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#2A1A1A', alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  infoText: { flex: 1 },
  hospName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  hospAddress: { fontSize: 13, color: '#888', marginTop: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statVal: { fontSize: 16, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: '#888' },
});
