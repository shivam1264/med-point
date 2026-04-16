import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, Alert, StatusBar, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../context/AuthContext';
import sosService from '../../services/sosService';
import type { Emergency } from '../../types';

export function AmbulanceHomeScreen({ navigation }: any) {
  const { driver, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(driver?.isAvailable ?? false);
  const [isOnline, setIsOnline] = useState(driver?.isOnline ?? true);
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [pendingPopup, setPendingPopup] = useState<Emergency | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);

  // Poll for active emergency
  useEffect(() => {
    const poll = setInterval(async () => {
      if (!isOnline || !isAvailable) return;
      try {
        const emergency = await sosService.getActiveEmergency();
        if (emergency && emergency.status === 'pending' && !pendingPopup && !activeEmergency) {
          setPendingPopup(emergency);
          setCountdown(30);
        }
        if (emergency && (emergency.status === 'accepted' || emergency.status === 'in_progress')) {
          setActiveEmergency(emergency);
          setPendingPopup(null);
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(poll);
  }, [isOnline, isAvailable, pendingPopup, activeEmergency]);

  // Countdown for popup
  useEffect(() => {
    if (!pendingPopup) return;
    if (countdown <= 0) {
      handleDecline();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [pendingPopup, countdown]);

  // Update location every 30s
  useEffect(() => {
    if (!isOnline || !driver) return;
    const updateLoc = () => {
      Geolocation.getCurrentPosition(
        ({ coords }) => {
          sosService.updateAmbulanceStatus(driver.id, {
            currentLocation: { lat: coords.latitude, lng: coords.longitude }
          }).catch(() => {});
        },
        () => {}
      );
    };
    updateLoc();
    const interval = setInterval(updateLoc, 30000);
    return () => clearInterval(interval);
  }, [isOnline, driver]);

  const toggleOnline = async () => {
    if (!driver) return;
    try {
      const newOnline = !isOnline;
      await sosService.updateAmbulanceStatus(driver.id, { isOnline: newOnline, isAvailable: newOnline ? isAvailable : false });
      setIsOnline(newOnline);
      if (!newOnline) setIsAvailable(false);
    } catch { Alert.alert('Error', 'Could not update status'); }
  };

  const toggleAvailable = async () => {
    if (!driver || !isOnline) { Alert.alert('Go Online first'); return; }
    try {
      const newAvail = !isAvailable;
      await sosService.updateAmbulanceStatus(driver.id, { isAvailable: newAvail });
      setIsAvailable(newAvail);
    } catch { Alert.alert('Error', 'Could not update availability'); }
  };

  const handleAccept = async () => {
    if (!pendingPopup) return;
    setLoading(true);
    try {
      const emergency = await sosService.acceptEmergency(pendingPopup._id);
      setActiveEmergency(emergency);
      setPendingPopup(null);
      setIsAvailable(false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to accept');
    } finally { setLoading(false); }
  };

  const handleDecline = async () => {
    if (!pendingPopup) return;
    try {
      await sosService.declineEmergency(pendingPopup._id);
    } catch (_) {}
    setPendingPopup(null);
  };

  const handleComplete = async () => {
    if (!activeEmergency) return;
    Alert.alert('Complete Trip', 'Mark this emergency as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete', onPress: async () => {
          try {
            await sosService.completeEmergency(activeEmergency._id);
            setActiveEmergency(null);
            setIsAvailable(true);
            await sosService.updateAmbulanceStatus(driver!.id, { isAvailable: true });
            Alert.alert('✅ Done', 'Emergency completed. You are now available.');
          } catch { Alert.alert('Error', 'Could not complete.'); }
        }
      }
    ]);
  };

  const statusColor = !isOnline ? '#555' : isAvailable ? '#27AE60' : '#F39C12';
  const statusLabel = !isOnline ? 'Offline' : isAvailable ? 'Available' : 'Unavailable';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Popup Modal */}
      <Modal transparent visible={!!pendingPopup} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Icon name="alarm-light" size={32} color="#C0392B" />
              <Text style={styles.modalTitle}>🆘 New Emergency!</Text>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{countdown}s</Text>
              </View>
            </View>

            {pendingPopup && (
              <>
                <View style={styles.modalInfo}>
                  <View style={styles.modalRow}>
                    <Icon name="map-marker" size={18} color="#888" />
                    <Text style={styles.modalVal}>{pendingPopup.location?.address || `${pendingPopup.location?.lat?.toFixed(4)}, ${pendingPopup.location?.lng?.toFixed(4)}`}</Text>
                  </View>
                  {pendingPopup.hospitalName && (
                    <View style={styles.modalRow}>
                      <Icon name="hospital" size={18} color="#888" />
                      <Text style={styles.modalVal}>→ {pendingPopup.hospitalName}</Text>
                    </View>
                  )}
                  <View style={[styles.severityBadge, { backgroundColor: '#C0392B20' }]}>
                    <Text style={[styles.severityText, { color: '#C0392B' }]}>
                      {(pendingPopup.severity || 'critical').toUpperCase()} EMERGENCY
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptBtnText}>✓ Accept</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Driver: {driver?.driverName || 'Driver'}</Text>
            <Text style={styles.subGreeting}>{driver?.vehicleNumber} · {driver?.vehicleType}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Icon name="logout" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.statusHint}>
            {!isOnline ? 'Go online to receive emergencies' : isAvailable ? 'Waiting for SOS alerts...' : 'Toggle available to receive trips'}
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleBtn, isOnline && styles.toggleBtnActive]} onPress={toggleOnline}>
              <Icon name={isOnline ? 'wifi' : 'wifi-off'} size={18} color={isOnline ? '#fff' : '#666'} />
              <Text style={[styles.toggleBtnText, isOnline && styles.toggleBtnTextActive]}>
                {isOnline ? 'Online' : 'Go Online'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isAvailable && styles.availBtn]}
              onPress={toggleAvailable}
              disabled={!isOnline}>
              <Icon name="check-circle" size={18} color={isAvailable ? '#fff' : '#666'} />
              <Text style={[styles.toggleBtnText, isAvailable && styles.toggleBtnTextActive]}>
                {isAvailable ? 'Available' : 'Go Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Emergency */}
        {activeEmergency && (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>🚨 Active Emergency</Text>
            <View style={styles.activeRow}>
              <Icon name="map-marker" size={16} color="#888" />
              <Text style={styles.activeVal}>{activeEmergency.location?.address || 'GPS Location'}</Text>
            </View>
            {activeEmergency.hospitalName && (
              <View style={styles.activeRow}>
                <Icon name="hospital" size={16} color="#888" />
                <Text style={styles.activeVal}>{activeEmergency.hospitalName}</Text>
              </View>
            )}
            <View style={styles.activeActions}>
              <TouchableOpacity
                style={styles.navigateBtn}
                onPress={() => navigation.navigate('AmbulanceNav', { emergency: activeEmergency })}>
                <Icon name="navigation" size={16} color="#fff" />
                <Text style={styles.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                <Icon name="check-all" size={16} color="#fff" />
                <Text style={styles.completeBtnText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hospital Info */}
        {driver?.hospitalName && (
          <View style={styles.hospitalCard}>
            <Icon name="hospital-building" size={20} color="#C0392B" />
            <Text style={styles.hospitalText}>{driver.hospitalName}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subGreeting: { fontSize: 13, color: '#888', marginTop: 3 },
  logoutBtn: { padding: 6 },
  statusCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16,
    padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A'
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusLabel: { fontSize: 18, fontWeight: '700' },
  statusHint: { fontSize: 13, color: '#666', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#2A2A2A', borderRadius: 10, paddingVertical: 10
  },
  toggleBtnActive: { backgroundColor: '#C0392B' },
  availBtn: { backgroundColor: '#27AE60' },
  toggleBtnText: { color: '#666', fontWeight: '600', fontSize: 14 },
  toggleBtnTextActive: { color: '#fff' },
  activeCard: {
    backgroundColor: '#1A0A0A', borderRadius: 16,
    padding: 16, borderWidth: 1.5, borderColor: '#C0392B', marginBottom: 16
  },
  activeTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  activeRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  activeVal: { flex: 1, fontSize: 13, color: '#ccc' },
  activeActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  navigateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#378ADD', borderRadius: 10, paddingVertical: 10
  },
  navigateBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  completeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#27AE60', borderRadius: 10, paddingVertical: 10
  },
  completeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  hospitalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14
  },
  hospitalText: { fontSize: 14, color: '#aaa' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#fff' },
  countdownBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#C0392B', alignItems: 'center', justifyContent: 'center'
  },
  countdownText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  modalInfo: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 14, marginBottom: 20 },
  modalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  modalVal: { flex: 1, color: '#ddd', fontSize: 14 },
  severityBadge: { borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 4 },
  severityText: { fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  modalActions: { flexDirection: 'row', gap: 12 },
  declineBtn: {
    flex: 1, backgroundColor: '#2A2A2A', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center'
  },
  declineBtnText: { color: '#888', fontWeight: '700', fontSize: 16 },
  acceptBtn: {
    flex: 2, backgroundColor: '#C0392B', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center'
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
