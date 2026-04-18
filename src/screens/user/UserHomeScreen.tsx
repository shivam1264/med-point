import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Animated, StatusBar, ScrollView, PermissionsAndroid, Platform, Modal, Image
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../context/AuthContext';
import sosService from '../../services/sosService';
import hospitalService from '../../services/hospitalService';
import { SOCKET_URL } from '../../config';
import { Colors } from '../../constants/colors';

import type { Emergency, Hospital } from '../../types';

export function UserHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  // 1. Helper Functions
  async function requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'MedFlow needs access to your location for emergency dispatch.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location access is required for SOS.');
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async function checkActiveEmergency() {
    try {
      const emergency = await sosService.getMyEmergency();
      setActiveEmergency(emergency);
    } catch (_) {
    } finally {
      setCheckingStatus(false);
    }
  }

  async function handleSOS() {
    if (activeEmergency) {
      navigation.navigate('UserEmergencyTrack', { emergencyId: activeEmergency._id });
      return;
    }
    navigation.navigate('Hospitals', { isEmergency: true });
  }

  function triggerSOS(targetHospitalId?: string) {
    setLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          const result = await sosService.triggerSOS(lat, lng, targetHospitalId);
          setActiveEmergency(result.data);
          Alert.alert(
            '🆘 SOS Sent!',
            'Emergency request created. We are finding the nearest available ambulance for you.',
            [{ text: 'OK' }]
          );
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'Failed to send SOS. Try again.';
          Alert.alert('Error', msg);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        Alert.alert('Location Error', 'Could not get your location. Please enable GPS.');
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 10000 }
    );
  }

  // 2. Lifecycle Effects
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    requestLocationPermission();
    checkActiveEmergency();

    if (user?.id) {
      const socket = require('socket.io-client').io(SOCKET_URL, {
        transports: ['websocket']
      });

      socket.on('connect', () => {
        socket.emit('join_user', user.id);
      });

      socket.on('emergency_accepted', (data: any) => {
        checkActiveEmergency();
        Alert.alert('🚑 Ambulance Assigned!', `Driver ${data.driverName} has accepted your request.`);
      });

      socket.on('emergency_cancelled', (data: any) => {
        setActiveEmergency(null);
        Alert.alert('Cancelled', 'Your emergency request was cancelled.');
      });

      socket.on('emergency_completed', () => {
        setActiveEmergency(null);
        Alert.alert('Finished', 'Your emergency trip has been completed.');
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.id]);

  async function handleCancelSOS() {
    if (!activeEmergency) return;

    Alert.alert(
      'Cancel SOS',
      'Are you sure you want to cancel? This will stop medical help.',
      [
        { text: 'Keep SOS', style: 'cancel' },
        { 
          text: 'Confirm Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await sosService.cancelSOS(activeEmergency._id);
              setActiveEmergency(null);
            } catch (err: any) {
              const msg = err.response?.data?.message || "";
              if (msg.includes("completed") || msg.includes("cancelled")) {
                 setActiveEmergency(null);
              } else {
                Alert.alert('Error', 'Failed to cancel SOS.');
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoHeader} 
              resizeMode="contain" 
            />
          <View style={styles.profileBtn}>
            <Icon name="shield-check" size={28} color={Colors.primary} />
          </View>
        </View>



        {/* Emergency Alert Banner */}
        {activeEmergency ? (
          <View style={[styles.activeBanner, { borderLeftColor: activeEmergency.status === 'pending' ? Colors.warning : Colors.success }]}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerRow}>
                <View style={[styles.statusIndicator, { backgroundColor: activeEmergency.status === 'pending' ? Colors.warning : Colors.success }]} />
                <Text style={styles.bannerTitle}>
                  {activeEmergency.status === 'pending' ? 'Dispatching Help...' : 'Ambulance En Route'}
                </Text>
              </View>
              {activeEmergency.ambulanceDriverName && (
                <Text style={styles.bannerSub}>{activeEmergency.ambulanceDriverName} • {activeEmergency.ambulanceVehicleNumber}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.actionBtnTrack}
              onPress={() => navigation.navigate('UserEmergencyTrack', { emergencyId: activeEmergency._id })}
            >
              <Text style={styles.actionBtnText}>Track</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.healthTipBanner}>
            <Icon name="heart-pulse" size={24} color={Colors.danger} />
            <Text style={styles.healthTipText}>Help is one tap away in any emergency.</Text>
          </View>
        )}

        {/* SOS Center */}
        <View style={styles.sosContainer}>
          <Text style={styles.sosPrompt}>Emergency Assistance</Text>

          <View style={styles.pulseWrapper}>
             <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }]} />
             <TouchableOpacity 
                style={[styles.sosButton, activeEmergency && styles.sosButtonActive]}
                onPress={handleSOS}
                disabled={loading}
                activeOpacity={0.8}
             >
               {loading ? <ActivityIndicator size="large" color={Colors.white} /> : (
                 <>
                   <Icon name="alert-decagram" size={60} color={Colors.white} />
                   <Text style={styles.sosLabelLarge}>SOS</Text>
                 </>
               )}
             </TouchableOpacity>
          </View>
          <Text style={styles.sosFooter}>Get immediate help from nearby hospitals</Text>

        </View>

        {/* Navigation Grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Hospitals')}>
            <View style={[styles.gridIconBox, { backgroundColor: Colors.infoLight }]}>
              <Icon name="hospital-building" size={28} color={Colors.info} />
            </View>
            <Text style={styles.gridTitle}>Hospitals</Text>
            <Text style={styles.gridSub}>Nearby Clinics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Doctors')}>
            <View style={[styles.gridIconBox, { backgroundColor: Colors.successLight }]}>
              <Icon name="doctor" size={28} color={Colors.success} />
            </View>
            <Text style={styles.gridTitle}>Doctors</Text>
            <Text style={styles.gridSub}>Find Specialist</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('History')}>
            <View style={[styles.gridIconBox, { backgroundColor: Colors.warningLight }]}>
              <Icon name="clipboard-text-outline" size={28} color={Colors.warning} />
            </View>
            <Text style={styles.gridTitle}>History</Text>
            <Text style={styles.gridSub}>Medical Logs</Text>
          </TouchableOpacity>

        </View>

        {/* Panic Actions */}
        <View style={styles.panicRow}>
           <TouchableOpacity style={[styles.panicBtn, { backgroundColor: Colors.grayLight }]} onPress={handleCancelSOS}>
              <Icon name="close-circle-outline" size={20} color={Colors.gray} />
              <Text style={styles.panicBtnText}>Stop Help</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.panicBtn, { backgroundColor: '#FBE9E7' }]}>
              <Icon name="phone-plus" size={20} color={Colors.danger} />
              <Text style={[styles.panicBtnText, { color: Colors.danger }]}>Family Call</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 8
  },
  logoHeader: { width: 140, height: 44 },

  profileBtn: { padding: 4 },


  healthTipBanner: {
    marginHorizontal: 24, backgroundColor: Colors.grayLight,
    padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12
  },
  healthTipText: { flex: 1, fontSize: 14, color: Colors.textSecondary, fontWeight: '700' },

  activeBanner: {
    marginHorizontal: 24, backgroundColor: Colors.white,
    padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
  },
  bannerContent: { flex: 1 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusIndicator: { width: 10, height: 10, borderRadius: 5 },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  bannerSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  actionBtnTrack: { backgroundColor: Colors.info, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  actionBtnText: { color: Colors.white, fontWeight: '800', fontSize: 13 },

  sosContainer: { alignItems: 'center', marginVertical: 40 },
  sosPrompt: { fontSize: 13, fontWeight: '800', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 30 },
  pulseWrapper: { alignItems: 'center', justifyContent: 'center' },
  pulseOuter: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.dangerLight, opacity: 0.6
  },
  sosButton: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
    borderWidth: 8, borderColor: 'rgba(255,255,255,0.2)'
  },
  sosButtonActive: { backgroundColor: Colors.success, shadowColor: Colors.success },
  sosLabelLarge: { color: Colors.white, fontSize: 32, fontWeight: '900', marginTop: -4 },
  sosFooter: { fontSize: 13, color: Colors.textTertiary, marginTop: 32, fontWeight: '700', textAlign: 'center', paddingHorizontal: 40 },


  grid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  gridCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 24, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  gridIconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  gridSub: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },

  panicRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12 },
  panicBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 16
  },
  panicBtnText: { fontSize: 14, fontWeight: '800', color: Colors.textSecondary }
});

