import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { io, Socket } from 'socket.io-client';
import sosService from '../../services/sosService';
import mapService, { RoutePoint } from '../../services/mapService';

import { SOCKET_URL } from '../../config';


interface Location { lat: number; lng: number; }

export function UserEmergencyTrackScreen({ route, navigation }: any) {
  const { emergencyId } = route.params;
  const [emergency, setEmergency] = useState<any>(null);
  const [ambLoc, setAmbLoc] = useState<Location | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const mapRef = useRef<MapView>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Fetch initial emergency info
    sosService.getMyEmergency().then((data: any) => {
      setEmergency(data);
      // Fallback: If ambulance has last location
      if (data?.ambulance?.location?.coordinates) {
        setAmbLoc({
          lat: data.ambulance.location.coordinates[1],
          lng: data.ambulance.location.coordinates[0],
        });
      }
    });

    // 2. Setup socket
    const socket = io(SOCKET_URL, {
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('User Tracking Socket connected');
    });

    socket.on('ambulance_location_update', (data: any) => {
      console.log('Location Update received for:', data.ambulanceId);
      
      // The emergency object might have ambulance as an ID string or a populated object
      const ambulanceData = emergency?.ambulance;
      const currentAmbId = typeof ambulanceData === 'string' ? ambulanceData : ambulanceData?._id;

      if (currentAmbId && currentAmbId.toString() === data.ambulanceId.toString()) {
        console.log('Matching Ambulance! Updating marker to:', data.lat, data.lng);
        setAmbLoc({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [emergency?.ambulance?._id]);

  useEffect(() => {
    // Re-center map if both locations are known
    if (ambLoc && emergency?.location?.coordinates && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: ambLoc.lat, longitude: ambLoc.lng },
          { latitude: emergency.location.coordinates[1], longitude: emergency.location.coordinates[0] }
        ],
        { edgePadding: { top: 100, right: 50, bottom: 200, left: 50 }, animated: true }
      );
    }
  }, [ambLoc, emergency]);

  // Fetch road-based route from OSRM
  useEffect(() => {
    const patLat = emergency?.location?.coordinates?.[1];
    const patLng = emergency?.location?.coordinates?.[0];

    if (ambLoc && patLat && patLng) {
      mapService.getRoute(
        { lat: ambLoc.lat, lng: ambLoc.lng },
        { lat: patLat, lng: patLng }
      ).then(result => {
        if (result.status !== 'OK' && result.error) {
          Alert.alert('Google API Alert', `Status: ${result.status}\nMessage: ${result.error}`);
        }
        setRoutePoints(result.points);
      });
    }
  }, [ambLoc?.lat, ambLoc?.lng, emergency?.location]);

  if (!emergency) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 100}}>Tracking Initializing...</Text>
      </SafeAreaView>
    );
  }

  const patLat = emergency.location.coordinates[1];
  const patLng = emergency.location.coordinates[0];

  console.log('Patient Track Params:', { patLat, patLng, ambLat: ambLoc?.lat, ambLng: ambLoc?.lng });

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
          latitude: patLat,
          longitude: patLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>

        {/* Patient Marker */}
        <Marker coordinate={{ latitude: patLat, longitude: patLng }} title="You">
          <View style={styles.patientMarker}>
            <Icon name="account" size={20} color="#fff" />
          </View>
        </Marker>

        {/* Ambulance Marker */}
        {ambLoc && (
          <Marker coordinate={{ latitude: ambLoc.lat, longitude: ambLoc.lng }} title="Ambulance">
            <View style={styles.ambMarker}>
              <Icon name="ambulance" size={20} color="#000" />
            </View>
          </Marker>
        )}

        {/* Route Line between Patient & Ambulance */}
        {routePoints.length > 0 ? (
          <>
            <Polyline
              coordinates={routePoints}
              strokeColor="#4285F440"
              strokeWidth={10}
            />
            <Polyline
              coordinates={routePoints}
              strokeColor="#4285F4"
              strokeWidth={5}
              lineJoin="round"
              lineCap="round"
            />
          </>
        ) : ambLoc && (
          <>
            <Polyline
              coordinates={[
                { latitude: patLat, longitude: patLng },
                { latitude: ambLoc.lat, longitude: ambLoc.lng }
              ]}
              strokeColor="#4285F430"
              strokeWidth={6}
            />
            <Polyline
              coordinates={[
                { latitude: patLat, longitude: patLng },
                { latitude: ambLoc.lat, longitude: ambLoc.lng }
              ]}
              strokeColor="#4285F4"
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          </>
        )}
      </MapView>

      <View style={styles.infoCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, {backgroundColor: '#27AE60'}]} />
          <Text style={styles.statusText}>Ambulance is arriving...</Text>
        </View>

        {emergency.ambulance && (
          <View style={styles.driverInfo}>
            <View style={styles.driverIcon}>
              <Icon name="account-tie" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.driverName}>{emergency.ambulanceDriverName}</Text>
              <Text style={styles.driverSub}>{emergency.ambulanceVehicleNumber}</Text>
            </View>
            <View style={{flex: 1}} />
            <View style={styles.otpBadge}>
               <Text style={styles.otpLabel}>OTP</Text>
               <Text style={styles.otpValue}>{emergency.pickupOTP || '----'}</Text>
            </View>
          </View>

        )}

        {emergency.hospitalName && (
          <View style={styles.hospRow}>
            <Icon name="hospital-building" size={20} color="#C0392B" />
            <Text style={styles.hospName}>{emergency.hospitalName}</Text>
          </View>
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center'
  },
  patientMarker: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  ambMarker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F39C12',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  statusText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  driverInfo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2A2A2A', padding: 14, borderRadius: 12, marginBottom: 12
  },
  driverIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#444',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  driverName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  driverSub: { fontSize: 13, color: '#aaa', marginTop: 2 },
  hospRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  hospName: { fontSize: 14, color: '#888' },
});
