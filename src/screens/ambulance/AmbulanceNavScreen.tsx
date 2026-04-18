import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Modal, TextInput, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../context/AuthContext';
import mapService, { RoutePoint } from '../../services/mapService';
import sosService from '../../services/sosService';
import { SOCKET_URL } from '../../config';
import { Colors } from '../../constants/colors';
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
  const [otpInput, setOtpInput] = React.useState('');
  const [showOtpModal, setShowOtpModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  const { driver } = useAuth();
  const socketRef = React.useRef<Socket | null>(null);
  const mapRef = React.useRef<MapView | null>(null);

  // Broadast live location to patient
  React.useEffect(() => {
    if (!driver?.id) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_ambulance', driver.id);
    });

    socket.on('emergency_cancelled', (data: any) => {
      Alert.alert(
        'Mission Aborted',
        'Patient has cancelled the request. Returning to base.',
        [{ text: 'OK', onPress: () => navigation.navigate('AmbTabs') }]
      );
    });

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverLoc({ latitude, longitude });
      },
      (err) => console.warn('Loc update:', err),
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
      (err) => console.warn('Nav Loc:', err),
      { enableHighAccuracy: true, distanceFilter: 10, interval: 3000 }
    );

    return () => {
      socket.disconnect();
      Geolocation.clearWatch(watchId);
    };
  }, [driver?.id]);

  // Fetch route periodically
  React.useEffect(() => {
    const fetchNewRoute = async () => {
      if (!driverLoc) return;

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
      
      try {
        const result = await mapService.getRoute(
          { lat: driverLoc.latitude, lng: driverLoc.longitude },
          dest
        );
        setRoutePoints(result.points);
        setLastUpdate({ phase, loc: driverLoc });
      } catch (err) {
        console.warn('Routing err:', err);
      }
    };

    fetchNewRoute();
  }, [driverLoc?.latitude, driverLoc?.longitude, phase]);

  React.useEffect(() => {
    if (driverLoc && mapRef.current) {
      const dest = phase === 'PICKUP' 
        ? { latitude: patLat, longitude: patLng } 
        : { latitude: hospLat, longitude: hospLng };
      
      mapRef.current.fitToCoordinates(
        [{ latitude: driverLoc.latitude, longitude: driverLoc.longitude }, dest],
        { edgePadding: { top: 100, right: 50, bottom: 250, left: 50 }, animated: true }
      );
    }
  }, [driverLoc === null, phase]);
  
  const handleComplete = async () => {
    if (otpInput !== emergency.pickupOTP) {
      Alert.alert('Verification Failed', 'The pickup OTP does not match.');
      return;
    }

    try {
      setLoading(true);
      await sosService.completeEmergency(emergency._id, otpInput);
      Alert.alert('Mission Complete', 'Patient successfully handed over.', [{ text: 'OK', onPress: () => navigation.navigate('AmbTabs') }]);
    } catch (err: any) {
      Alert.alert('Error', 'Unable to finalize mission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        initialRegion={{ latitude: patLat, longitude: patLng, latitudeDelta: 0.06, longitudeDelta: 0.06 }}>
        
        {/* Patient Marker */}
        <Marker coordinate={{ latitude: patLat, longitude: patLng }}>
          <View style={[styles.markerRing, { borderColor: Colors.info + '40' }]}>
             <View style={[styles.markerCore, { backgroundColor: Colors.info }]}>
                <Icon name="account" size={16} color={Colors.white} />
             </View>
          </View>
        </Marker>

        {/* Hospital Marker */}
        <Marker coordinate={{ latitude: hospLat, longitude: hospLng }}>
           <View style={[styles.markerRing, { borderColor: Colors.danger + '40' }]}>
              <View style={[styles.markerCore, { backgroundColor: Colors.danger }]}>
                 <Icon name="hospital-building" size={18} color={Colors.white} />
              </View>
           </View>
        </Marker>

        {/* Ambulance Local Marker */}
        {driverLoc && (
          <Marker coordinate={driverLoc} flat rotation={0}>
             <View style={styles.ambMarker}>
                <Icon name="truck-delivery" size={24} color={Colors.success} />
             </View>
          </Marker>
        )}
        
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor={phase === 'PICKUP' ? Colors.info : Colors.danger}
            strokeWidth={5}
            lineJoin="round"
            lineCap="round"
          />
        )}
      </MapView>

      {/* TRIP CONTROLS */}
      <View style={styles.navCard}>
         <View style={styles.stepper}>
            <View style={styles.stepUnit}>
               <View style={[styles.stepCircle, phase === 'PICKUP' ? styles.stepActive : styles.stepDone]}>
                  <Icon name={phase === 'PICKUP' ? 'map-marker-radius' : 'check'} size={14} color={Colors.white} />
               </View>
               <Text style={[styles.stepLabel, phase === 'PICKUP' && styles.labelActive]}>Rescue</Text>
            </View>
            <View style={[styles.stepConnector, phase === 'DROPOFF' && styles.connActive]} />
            <View style={styles.stepUnit}>
               <View style={[styles.stepCircle, phase === 'DROPOFF' && styles.stepActive]}>
                  <Icon name="hospital-marker" size={14} color={Colors.white} />
               </View>
               <Text style={[styles.stepLabel, phase === 'DROPOFF' && styles.labelActive]}>Facility</Text>
            </View>
         </View>

         <View style={styles.metaRow}>
            <View style={styles.metaMain}>
               <Text style={styles.metaTitle}>{phase === 'PICKUP' ? 'En Route to Patient' : 'En Route to Facility'}</Text>
               <Text style={styles.metaSub} numberOfLines={1}>
                  {phase === 'PICKUP' ? (emergency.location?.address || 'Geolocation Secured') : emergency.hospitalName}
               </Text>
            </View>
            <TouchableOpacity style={styles.callCircle} onPress={() => emergency.userPhone && Linking.openURL(`tel:${emergency.userPhone}`)}>
               <Icon name="phone" size={22} color={Colors.white} />
            </TouchableOpacity>
         </View>

         <TouchableOpacity 
            style={[styles.primaryAction, { backgroundColor: phase === 'PICKUP' ? Colors.info : Colors.success }]} 
            onPress={() => {
              if (phase === 'PICKUP') setPhase('DROPOFF');
              else setShowOtpModal(true);
            }}
         >
            <Text style={styles.primaryActionText}>
              {phase === 'PICKUP' ? 'MARK ARRIVAL AT PATIENT' : 'MARK ARRIVAL AT HOSPITAL'}
            </Text>
         </TouchableOpacity>
      </View>

      {/* OTP OVERLAY */}
      <Modal transparent visible={showOtpModal} animationType="slide">
        <View style={styles.overlay}>
           <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Final Handover</Text>
              <Text style={styles.sheetSub}>Input the verification code from the patient to finish.</Text>
              
              <TextInput
                style={styles.sheetInput}
                placeholder="----"
                placeholderTextColor={Colors.border}
                keyboardType="number-pad"
                maxLength={4}
                value={otpInput}
                onChangeText={setOtpInput}
                autoFocus
              />

              <View style={styles.sheetActions}>
                 <TouchableOpacity style={styles.sheetSecondary} onPress={() => { setShowOtpModal(false); setOtpInput(''); }}>
                    <Text style={styles.secText}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.sheetPrimary} disabled={loading} onPress={() => { setShowOtpModal(false); handleComplete(); }}>
                    {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.priText}>CONFIRM COMPLETION</Text>}
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  
  markerRing: { 
    width: 40, height: 40, borderRadius: 20, borderWidth: 8, 
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white 
  },
  markerCore: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ambMarker: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  
  navCard: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36, 
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 20
  },
  
  stepper: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  stepUnit: { alignItems: 'center' },
  stepCircle: { 
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.grayLight, 
    alignItems: 'center', justifyContent: 'center' 
  },
  stepActive: { backgroundColor: Colors.info },
  stepDone: { backgroundColor: Colors.success },
  stepLabel: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, marginTop: 4, textTransform: 'uppercase' },
  labelActive: { color: Colors.textPrimary },
  stepConnector: { flex: 1, height: 2, backgroundColor: Colors.grayLight, marginHorizontal: 8, marginTop: -14 },
  connActive: { backgroundColor: Colors.info },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  metaMain: { flex: 1 },
  metaTitle: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  metaSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },
  callCircle: { 
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.info, 
    alignItems: 'center', justifyContent: 'center', elevation: 4 
  },

  primaryAction: { 
    paddingVertical: 18, borderRadius: 20, alignItems: 'center',
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  primaryActionText: { color: Colors.white, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  // MODAL
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { 
    backgroundColor: Colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36, 
    padding: 32, paddingBottom: 40 
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.grayLight, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  sheetSub: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 10, marginBottom: 32 },
  sheetInput: {
    backgroundColor: Colors.grayLight, borderRadius: 20, height: 72, 
    fontSize: 32, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center',
    letterSpacing: 20, marginBottom: 32
  },
  sheetActions: { flexDirection: 'row', gap: 16 },
  sheetSecondary: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  secText: { fontSize: 15, fontWeight: '800', color: Colors.textTertiary },
  sheetPrimary: { flex: 2, backgroundColor: Colors.success, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  priText: { fontSize: 15, fontWeight: '900', color: Colors.white }
});

