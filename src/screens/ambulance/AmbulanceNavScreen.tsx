import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../context/AuthContext';
import mapService, { RoutePoint } from '../../services/mapService';
import type { Emergency } from '../../types';

interface Props {
  route: { params: { emergency: Emergency } };
  navigation: any;
}

export function AmbulanceNavScreen({ route, navigation }: Props) {
  const { emergency } = route.params;
  const patLat = emergency.location?.coordinates?.[1] ?? 23.25;
  const patLng = emergency.location?.coordinates?.[0] ?? 77.41;
  const hospLat = emergency.hospitalLat ?? 23.21;
  const hospLng = emergency.hospitalLng ?? 77.44;
  const [routePoints, setRoutePoints] = React.useState<RoutePoint[]>([]);
  const [phase, setPhase] = React.useState<'PICKUP' | 'DROPOFF'>('PICKUP');
  const [driverLoc, setDriverLoc] = React.useState<RoutePoint | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<{ phase: string; loc: RoutePoint } | null>(null);
  
  const { driver } = useAuth();
  const socketRef = React.useRef<Socket | null>(null);
  const mapRef = React.useRef<MapView | null>(null);

  console.log('Nav Screen Params:', { patLat, patLng, hospLat, hospLng });

  // Broadast live location to patient
  React.useEffect(() => {
    if (!driver?.id) return;

    const socket = io('http://localhost:5000', {
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Nav Screen Socket connected');
      // Must join the room to receive targeted cancellations
      socket.emit('join_ambulance', driver.id);
    });

    socket.on('emergency_cancelled', (data: any) => {
      console.log('SOS Cancelled while navigating!', data);
      Alert.alert(
        'SOS Cancelled',
        'User has cancelled the emergency request. Returning to home screen.',
        [{ text: 'OK', onPress: () => navigation.navigate('AmbTabs') }]
      );
    });

    // Get an immediate first location fix
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverLoc({ latitude, longitude });
      },
      (err) => console.warn('First fix error:', err),
      { enableHighAccuracy: true }
    );

    const watchId = Geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverLoc({ latitude, longitude });
        
        socket.emit('driver_location', {
          ambulanceId: driver.id,
          lat: latitude,
          lng: longitude
        });
      },
      (err) => console.warn('Nav Location Error:', err),
      { enableHighAccuracy: true, distanceFilter: 10, interval: 3000 }
    );

    return () => {
      socket.disconnect();
      Geolocation.clearWatch(watchId);
    };
  }, [driver?.id]);

  // Fetch route periodically or on phase change
  React.useEffect(() => {
    const fetchNewRoute = async () => {
      if (!driverLoc) return;

      // Re-fetch if phase changed OR if moved > 50m
      if (lastUpdate && lastUpdate.phase === phase) {
        const dist = Math.sqrt(
          Math.pow(driverLoc.latitude - lastUpdate.loc.latitude, 2) + 
          Math.pow(driverLoc.longitude - lastUpdate.loc.longitude, 2)
        );
        if (dist < 0.0005) return; 
      }

      const dest = phase === 'PICKUP' 
        ? { lat: patLat, lng: patLng } 
        : { lat: hospLat, lng: hospLng };

      console.log(`Calculating route (${phase}):`, driverLoc, 'to', dest);
      
      try {
        const result = await mapService.getRoute(
          { lat: driverLoc.latitude, lng: driverLoc.longitude },
          dest
        );

        if (result.status !== 'OK' && result.error) {
          console.warn('Routing Diagnostic:', result.status, result.error);
          // Show alert only once to diagnose
          Alert.alert(
            'Google API Alert',
            `Status: ${result.status}\nMessage: ${result.error || 'Enable Directions API in Console'}`
          );
        }

        setRoutePoints(result.points);
        setLastUpdate({ phase, loc: driverLoc });
      } catch (err) {
        console.warn('Route fetch error:', err);
      }
    };

    fetchNewRoute();
  }, [driverLoc?.latitude, driverLoc?.longitude, phase]);

  // Auto-zoom to fit both points when driver location is first received
  React.useEffect(() => {
    if (driverLoc && mapRef.current) {
      const dest = phase === 'PICKUP' 
        ? { latitude: patLat, longitude: patLng } 
        : { latitude: hospLat, longitude: hospLng };
      
      mapRef.current.fitToCoordinates(
        [{ latitude: driverLoc.latitude, longitude: driverLoc.longitude }, dest],
        { edgePadding: { top: 100, right: 50, bottom: 200, left: 50 }, animated: true }
      );
    }
  }, [driverLoc === null, phase]); // Run when driverLoc first goes from null to something, or phase changes

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={22} color="#fff" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
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

        {/* Live Ambulance Marker */}
        {driverLoc && (
          <Marker coordinate={driverLoc} title="Your Location">
             <View style={styles.ambMarker}>
               <Icon name="ambulance" size={24} color={phase === 'PICKUP' ? '#378ADD' : '#C0392B'} />
             </View>
          </Marker>
        )}
        
        {routePoints.length > 0 ? (
          <>
            {/* Shadow/Glow Background */}
            <Polyline
              coordinates={routePoints}
              strokeColor={phase === 'PICKUP' ? '#378ADD30' : '#C0392B30'}
              strokeWidth={12}
            />
            {/* Main Primary Line */}
            <Polyline
              coordinates={routePoints}
              strokeColor={phase === 'PICKUP' ? '#378ADD' : '#C0392B'}
              strokeWidth={6}
              lineJoin="round"
              lineCap="round"
            />
          </>
        ) : (
          <>
            <Polyline
              coordinates={[{ latitude: patLat, longitude: patLng }, { latitude: hospLat, longitude: hospLng }]}
              strokeColor={phase === 'PICKUP' ? '#378ADD20' : '#C0392B20'}
              strokeWidth={6}
            />
            <Polyline
              coordinates={[{ latitude: patLat, longitude: patLng }, { latitude: hospLat, longitude: hospLng }]}
              strokeColor={phase === 'PICKUP' ? '#378ADD' : '#C0392B'}
              strokeWidth={4}
              lineDashPattern={[10, 5]}
            />
          </>
        )}
      </MapView>

      <View style={styles.infoCard}>
        <View style={styles.phase}>
          <View style={[styles.phaseStep, phase === 'PICKUP' ? styles.phaseActive : styles.phaseDone]}>
            <Icon name={phase === 'PICKUP' ? 'map-marker-distance' : 'check'} size={14} color="#fff" />
          </View>
          <Text style={[styles.phaseLabel, phase === 'PICKUP' && styles.activeText]}>Reach Patient</Text>
          <View style={[styles.phaseLine, phase === 'DROPOFF' && styles.lineActive]} />
          <View style={[styles.phaseStep, phase === 'DROPOFF' && styles.phaseActive]}>
            <Icon name="hospital-building" size={14} color="#fff" />
          </View>
          <Text style={[styles.phaseLabel, phase === 'DROPOFF' && styles.activeText]}>To Hospital</Text>
        </View>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => {
            if (phase === 'PICKUP') setPhase('DROPOFF');
            else navigation.goBack(); // Or complete emergency
          }}
        >
          <Text style={styles.actionBtnText}>
            {phase === 'PICKUP' ? 'ARRIVED AT PATIENT' : 'ARRIVED AT HOSPITAL'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

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
  phaseDone: { backgroundColor: '#27AE60' },
  phaseStepText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  phaseLabel: { fontSize: 13, color: '#888', marginRight: 6 },
  activeText: { color: '#fff', fontWeight: '600' },
  phaseLine: { flex: 1, height: 2, backgroundColor: '#2A2A2A' },
  lineActive: { backgroundColor: '#C0392B' },
  actionBtn: {
    backgroundColor: '#C0392B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6
  },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowText: { flex: 1, fontSize: 13, color: '#ccc' },
});
