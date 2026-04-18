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
  safe: { flex: 1, backgroundColor: '#050505' },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 20, zIndex: 10,
    width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  
  patientMarker: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff',
    shadowColor: '#C0392B', shadowOpacity: 0.5, shadowRadius: 10
  },
  ambMarker: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 8
  },
  
  infoCard: {
    backgroundColor: '#0D0D0D', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20
  },
  
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10, shadowOpacity: 1, shadowRadius: 5 },
  statusText: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  
  driverInfo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 18, borderRadius: 20, 
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  driverIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    borderWidth: 1, borderColor: '#222'
  },
  driverName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  driverSub: { fontSize: 13, color: '#555', marginTop: 2, fontWeight: '600' },
  
  otpBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)', paddingVertical: 8, paddingHorizontal: 16, 
    borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(39, 174, 96, 0.3)'
  },
  otpLabel: { fontSize: 10, fontWeight: '900', color: '#27AE60', marginBottom: 2, textTransform: 'uppercase' },
  otpValue: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  
  hospRow: { 
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10,
    backgroundColor: 'rgba(192, 57, 43, 0.05)', padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(192, 57, 43, 0.1)'
  },
  hospName: { fontSize: 14, color: '#C0392B', fontWeight: '800' },
});
