import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Animated, StatusBar, ScrollView, PermissionsAndroid, Platform, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../context/AuthContext';
import sosService from '../../services/sosService';
import hospitalService from '../../services/hospitalService';
import { SOCKET_URL } from '../../config';

import type { Emergency, Hospital } from '../../types';

export function UserHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  // 1. Helper Functions (Defined first to avoid hoisting issues)
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
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    requestLocationPermission();
    checkActiveEmergency();

    // 3. Real-time Status Updates via Socket
    if (user?.id) {
      const socket = require('socket.io-client').io(SOCKET_URL, {
        transports: ['websocket']
      });


      socket.on('connect', () => {
        socket.emit('join_user', user.id);
        console.log('👤 Home Socket: Joined User Room', user.id);
      });

      socket.on('emergency_accepted', (data: any) => {
        console.log('🚑 SOS Accepted by Driver!', data);
        checkActiveEmergency(); // Re-fetch full emergency details
        Alert.alert('🚑 Ambulance Assigned!', `Driver ${data.driverName} has accepted your request and is on the way.`);
      });

      socket.on('emergency_cancelled', (data: any) => {
        console.log('🆘 SOS Cancelled!', data);
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
      'Are you sure you want to cancel this emergency? This will alert the ambulance driver.',
      [
        { text: 'No, Keep Helping', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await sosService.cancelSOS(activeEmergency._id);
              setActiveEmergency(null);
              Alert.alert('Cancelled', 'Emergency SOS has been successfully cancelled.');
            } catch (err: any) {
              const errorMsg = err.response?.data?.message || "";
              if (errorMsg.includes("already completed") || errorMsg.includes("already cancelled")) {
                setActiveEmergency(null);
                Alert.alert('Notice', 'This emergency has already been completed or cancelled.');
              } else {
                console.error('Cancel SOS Error:', err.response?.data || err.message);
                Alert.alert('Error', 'Failed to cancel SOS. Please try again.');
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'accepted' || status === 'in_progress') return '#27AE60';
    if (status === 'pending') return '#F39C12';
    return '#888';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return '⏳ Finding ambulance...';
    if (status === 'accepted') return '🚑 Ambulance is on the way!';
    if (status === 'in_progress') return '🏥 Taking you to hospital...';
    return status;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Patient'} 👋</Text>
            <Text style={styles.headerSub}>Stay safe. Help is one tap away.</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Icon name="logout" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Active Emergency Banner */}
        {activeEmergency && (
          <View style={[styles.emergencyBanner, { borderColor: getStatusColor(activeEmergency.status) }]}>
            <Icon name="ambulance" size={24} color={getStatusColor(activeEmergency.status)} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.emergencyBannerTitle}>{getStatusLabel(activeEmergency.status)}</Text>
              {activeEmergency.ambulanceDriverName && (
                <Text style={styles.emergencyBannerSub}>Driver: {activeEmergency.ambulanceDriverName} · {activeEmergency.ambulanceVehicleNumber}</Text>
              )}
              {activeEmergency.hospitalName && (
                <Text style={styles.emergencyBannerSub}>Hospital: {activeEmergency.hospitalName}</Text>
              )}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                {(activeEmergency.status === 'accepted' || activeEmergency.status === 'in_progress') && (
                  <TouchableOpacity
                    style={{ backgroundColor: '#378ADD', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                    onPress={() => navigation.navigate('UserEmergencyTrack', { emergencyId: activeEmergency._id })}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Track Live</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{ backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#444' }}
                  onPress={handleCancelSOS}
                >
                  <Text style={{ color: '#E74C3C', fontSize: 12, fontWeight: '700' }}>Cancel SOS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <Text style={styles.sosLabel}>Emergency SOS</Text>
          <Animated.View style={[styles.sosPulse, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[styles.sosBtn, activeEmergency && styles.sosBtnActive]}
              onPress={handleSOS}
              disabled={loading || checkingStatus}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <>
                  <Icon name="alarm-light" size={48} color="#fff" />
                  <Text style={styles.sosBtnText}>SOS</Text>
                  <Text style={styles.sosBtnSub}>Tap for Emergency</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.sosNote}>
            {activeEmergency ? 'Active SOS in progress' : 'Press to alert nearest ambulance'}
          </Text>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.cards}>
          <View style={styles.infoCard}>
            <Icon name="hospital-building" size={28} color="#C0392B" />
            <Text style={styles.cardNum}>10+</Text>
            <Text style={styles.cardLabel}>Hospitals{'\n'}Nearby</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="doctor" size={28} color="#27AE60" />
            <Text style={styles.cardNum}>11+</Text>
            <Text style={styles.cardLabel}>Doctors{'\n'}Available</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="ambulance" size={28} color="#F39C12" />
            <Text style={styles.cardNum}>24/7</Text>
            <Text style={styles.cardLabel}>Emergency{'\n'}Service</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingTop: 20, marginBottom: 20
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 4 },
  logoutBtn: { padding: 8 },
  emergencyBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 14,
    borderWidth: 1.5, padding: 14, marginBottom: 20
  },
  emergencyBannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  emergencyBannerSub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  sosSection: { alignItems: 'center', marginVertical: 20 },
  sosLabel: { fontSize: 13, color: '#888', marginBottom: 24, letterSpacing: 1.5, textTransform: 'uppercase' },
  sosPulse: { marginBottom: 20 },
  sosBtn: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12
  },
  sosBtnActive: { backgroundColor: '#27AE60', shadowColor: '#27AE60' },
  sosBtnText: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 4 },
  sosNote: { fontSize: 13, color: '#666', textAlign: 'center' },
  cards: { flexDirection: 'row', marginTop: 20 },
  infoCard: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: 14,
    padding: 16, alignItems: 'center', marginHorizontal: 4
  },
  cardNum: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 8 },
  cardLabel: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 4 },
});
