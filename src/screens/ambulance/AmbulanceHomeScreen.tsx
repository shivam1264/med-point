import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, Alert, StatusBar, ScrollView, Linking, TextInput, Image
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import sosService from '../../services/sosService';
import { SOCKET_URL } from '../../config';
import { Colors } from '../../constants/colors';

import type { Emergency } from '../../types';

export function AmbulanceHomeScreen({ navigation }: any) {
  const { driver, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(driver?.isAvailable ?? false);
  const [isOnline, setIsOnline] = useState(driver?.isOnline ?? true);
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [pendingPopup, setPendingPopup] = useState<Emergency | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const socketRef = React.useRef<Socket | null>(null);

  // Socket setup for real-time SOS alerts
  useEffect(() => {
    if (!driver?.id) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_ambulance', driver.id);
    });

    socket.on('new_emergency', (data: any) => {
      setPendingPopup(data);
      setCountdown(30);
    });

    socket.on('emergency_cancelled', (data: any) => {
      setActiveEmergency(null);
      setPendingPopup(null);
      setIsAvailable(true);
      Alert.alert('Mission Cancelled', 'The patient has cancelled the emergency request.');
    });

    return () => {
      socket.disconnect();
    };
  }, [driver?.id]);

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
        () => {},
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
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
    } catch { Alert.alert('Error', 'Update failed'); }
  };

  const toggleAvailable = async () => {
    if (!driver || !isOnline) { Alert.alert('Go Online first'); return; }
    try {
      const newAvail = !isAvailable;
      await sosService.updateAmbulanceStatus(driver.id, { isAvailable: newAvail });
      setIsAvailable(newAvail);
    } catch { Alert.alert('Error', 'Update failed'); }
  };

  const handleAccept = async () => {
    if (!pendingPopup) return;
    setLoading(true);
    try {
      const targetId = pendingPopup._id || pendingPopup.id || pendingPopup.emergencyId;
      if (!targetId) {
        Alert.alert('Error', 'Invalid request data.');
        setPendingPopup(null);
        return;
      }
      const emergency = await sosService.acceptEmergency(targetId);
      setActiveEmergency(emergency);
      setPendingPopup(null);
      setIsAvailable(false);
    } catch (err: any) {
      Alert.alert('Request Lapsed', 'Someone else accepted or user cancelled.');
      setPendingPopup(null);
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
    if (otpInput !== activeEmergency.pickupOTP) {
        Alert.alert('OTP Mismatch', 'Verification code is incorrect.');
        return;
    }
    try {
      setLoading(true);
      await sosService.completeEmergency(activeEmergency._id, otpInput);
      setActiveEmergency(null);
      setOtpInput('');
      setIsAvailable(true);
      await sosService.updateAmbulanceStatus(driver!.id, { isAvailable: true });
      Alert.alert('Mission Success', 'Mission completed and logged.');
    } catch { 
      Alert.alert('Error', 'Failed to complete.'); 
    } finally {
      setLoading(false);
    }
  };

  const statusColor = !isOnline ? Colors.textTertiary : isAvailable ? Colors.success : Colors.warning;
  const statusLabel = !isOnline ? 'OFFLINE' : isAvailable ? 'READY' : 'BUSY';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* EMERGENCY ALERT POPUP */}
      <Modal transparent visible={!!pendingPopup} animationType="slide">
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
               <View style={styles.alertIconBg}>
                  <Icon name="alarm-light" size={32} color={Colors.white} />
               </View>
               <View style={styles.alertHeaderInfo}>
                  <Text style={styles.alertMajor}>EMERGENCY ALERT</Text>
                  <Text style={styles.alertSub}>Patient requires priority dispatch</Text>
               </View>
               <View style={styles.alertTimer}>
                  <Text style={styles.timerText}>{countdown}s</Text>
               </View>
            </View>

            {pendingPopup && (
              <View style={styles.alertInfoBox}>
                <View style={styles.alertData}>
                  <Icon name="map-marker-radius" size={20} color={Colors.danger} />
                  <Text style={styles.alertVal} numberOfLines={2}>{pendingPopup.location?.address || 'Geolocation Pending'}</Text>
                </View>
                <View style={[styles.alertData, { marginTop: 12 }]}>
                  <Icon name="account-alert" size={20} color={Colors.info} />
                  <Text style={styles.alertVal}>{pendingPopup.userName || 'Emergency Request'}</Text>
                </View>
              </View>
            )}

            <View style={styles.alertActions}>
               <TouchableOpacity style={styles.declineAction} onPress={handleDecline}>
                  <Text style={styles.declineText}>Decline</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.acceptAction} onPress={handleAccept} disabled={loading}>
                  {loading ? <ActivityIndicator color={Colors.white} /> : (
                    <>
                      <Icon name="check-bold" size={20} color={Colors.white} />
                      <Text style={styles.acceptText}>Accept Mission</Text>
                    </>
                  )}
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
           <View>
              <Text style={styles.unitName}>{driver?.driverName}</Text>
              <Text style={styles.vehicleId}>{driver?.vehicleNumber} • {driver?.hospitalName}</Text>
           </View>
           <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoHeader} 
              resizeMode="contain" 
           />


        </View>

        {/* STATUS DASHBOARD */}
        <View style={styles.dashCard}>
           <View style={styles.statusMain}>
              <View style={[styles.statusPulse, { backgroundColor: statusColor + '20' }]}>
                 <View style={[styles.statusCore, { backgroundColor: statusColor }]} />
              </View>
              <View>
                 <Text style={styles.statusBig}>{statusLabel}</Text>
                 <Text style={styles.statusSmall}>
                    {!isOnline ? 'Commander is currently offline' : isAvailable ? 'Awaiting emergency dispatch' : 'Engaged in active mission'}
                 </Text>
              </View>
           </View>

           <View style={styles.controlRow}>
              <TouchableOpacity 
                 style={[styles.controlBtn, isOnline ? styles.controlOnline : styles.controlOffline]} 
                 onPress={toggleOnline}
              >
                 <Icon name="power" size={20} color={isOnline ? Colors.white : Colors.textSecondary} />
                 <Text style={[styles.controlText, { color: isOnline ? Colors.white : Colors.textSecondary }]}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                 </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                 style={[styles.controlBtn, isAvailable ? styles.controlAvail : styles.controlBusy]} 
                 onPress={toggleAvailable}
                 disabled={!isOnline}
              >
                 <Icon name="radio-tower" size={20} color={isAvailable ? Colors.white : Colors.textSecondary} />
                 <Text style={[styles.controlText, { color: isAvailable ? Colors.white : Colors.textSecondary }]}>
                    {isAvailable ? 'AVAILABLE' : 'BUSY'}
                 </Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* ACTIVE MISSION CARD */}
        {activeEmergency && (
          <View style={styles.missionCard}>
             <View style={styles.missionHeader}>
                <View style={styles.missionBadge}>
                   <Text style={styles.missionBadgeText}>ACTIVE TRIP</Text>
                </View>
                <TouchableOpacity onPress={() => activeEmergency.userPhone && Linking.openURL(`tel:${activeEmergency.userPhone}`)}>
                   <Icon name="phone-outgoing" size={22} color={Colors.info} />
                </TouchableOpacity>
             </View>

             <View style={styles.missionInfo}>
                <View style={styles.missionRow}>
                   <Icon name="account" size={20} color={Colors.textTertiary} />
                   <Text style={styles.missionText}>{activeEmergency.userName} • {activeEmergency.userPhone}</Text>
                </View>
                <View style={styles.missionRow}>
                   <Icon name="map-marker-circle" size={20} color={Colors.danger} />
                   <Text style={styles.missionText} numberOfLines={2}>{activeEmergency.location?.address || 'Coordinates Only'}</Text>
                </View>
             </View>

             <View style={styles.otpDivider}>
                <Text style={styles.otpHeader}>PATIENT PICKUP VERIFICATION</Text>
                <View style={styles.otpSlotRow}>
                   {[0, 1, 2, 3].map(i => (
                     <View key={i} style={styles.otpSlot}>
                        <Text style={styles.otpSlotVal}>{otpInput[i] || '•'}</Text>
                     </View>
                   ))}
                </View>
                <TouchableOpacity style={styles.otpEntryBtn} onPress={() => setShowOtpModal(true)}>
                   <Text style={styles.otpEntryText}>VERIFY PICKUP CODE</Text>
                </TouchableOpacity>
             </View>

             <View style={styles.missionActions}>
                <TouchableOpacity style={styles.mapAction} onPress={() => navigation.navigate('AmbulanceNav', { emergency: activeEmergency })}>
                   <Icon name="compass-outline" size={20} color={Colors.white} />
                   <Text style={styles.mapActionText}>OPEN NAVIGATION</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.finishAction} onPress={handleComplete}>
                   <Icon name="check-all" size={20} color={Colors.white} />
                   <Text style={styles.finishActionText}>COMPLETE</Text>
                </TouchableOpacity>
             </View>
          </View>
        )}

        {/* VERIFICATION MODAL */}
        <Modal transparent visible={showOtpModal} animationType="fade">
           <View style={styles.otpOverlay}>
              <View style={styles.otpSheet}>
                 <Text style={styles.otpSheetTitle}>Verify Patient</Text>
                 <Text style={styles.otpSheetInfo}>Enter the 4-digit security code from the patient's device.</Text>
                 <TextInput
                   style={styles.otpHiddenInput}
                   keyboardType="number-pad"
                   maxLength={4}
                   value={otpInput}
                   onChangeText={setOtpInput}
                   autoFocus
                   placeholder="----"
                   placeholderTextColor={Colors.border}
                 />
                 <View style={styles.otpSheetActions}>
                    <TouchableOpacity style={styles.otpSheetCancel} onPress={() => { setShowOtpModal(false); setOtpInput(''); }}>
                       <Text style={styles.otpSheetCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.otpSheetConfirm} onPress={() => { setShowOtpModal(false); handleComplete(); }}>
                       <Text style={styles.otpSheetConfirmText}>CONFIRM PICKUP</Text>
                    </TouchableOpacity>
                 </View>
              </View>
           </View>
        </Modal>

        {/* RECENT LOGS SUMMARY */}
        <View style={styles.logsMeta}>
           <Text style={styles.metaTitle}>DAILY OPERATIONS</Text>
           <View style={styles.statsRow}>
              <View style={styles.statBox}>
                 <Text style={styles.statVal}>08</Text>
                 <Text style={styles.statLabel}>Trips</Text>
              </View>
              <View style={styles.statBox}>
                 <Text style={styles.statVal}>4.8</Text>
                 <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statBox}>
                 <Text style={styles.statVal}>120</Text>
                 <Text style={styles.statLabel}>Mins</Text>
              </View>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },
  topBar: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingTop: 20, marginBottom: 24 
  },
  unitName: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  vehicleId: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },
  logoHeader: { width: 120, height: 40 },



  dashCard: { 
    marginHorizontal: 24, backgroundColor: Colors.white, borderRadius: 28, padding: 24,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4
  },
  statusMain: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  statusPulse: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  statusCore: { width: 16, height: 16, borderRadius: 8 },
  statusBig: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 0.5 },
  statusSmall: { fontSize: 13, color: Colors.textTertiary, fontWeight: '600', marginTop: 2 },

  controlRow: { flexDirection: 'row', gap: 12 },
  controlBtn: { 
     flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
     gap: 10, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5
  },
  controlText: { fontWeight: '800', fontSize: 13 },
  controlOffline: { backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },
  controlOnline: { backgroundColor: Colors.info, borderColor: Colors.info, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  controlAvail: { backgroundColor: Colors.success, borderColor: Colors.success, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  controlBusy: { backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },

  missionCard: { 
    marginHorizontal: 24, marginTop: 24, backgroundColor: Colors.white, borderRadius: 28, padding: 24,
    borderWidth: 2, borderColor: Colors.dangerLight,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 4
  },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  missionBadge: { backgroundColor: Colors.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  missionBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  missionInfo: { gap: 12, marginBottom: 24 },
  missionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  missionText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '700' },

  otpDivider: { 
    backgroundColor: Colors.grayLight, borderRadius: 20, padding: 16, marginBottom: 24, alignItems: 'center' 
  },
  otpHeader: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, marginBottom: 16, letterSpacing: 1 },
  otpSlotRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  otpSlot: { 
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.white, 
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border 
  },
  otpSlotVal: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  otpEntryBtn: { width: '100%', backgroundColor: Colors.danger, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  otpEntryText: { color: Colors.white, fontWeight: '900', fontSize: 13 },

  missionActions: { flexDirection: 'row', gap: 12 },
  mapAction: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, backgroundColor: Colors.info, paddingVertical: 14, borderRadius: 16 
  },
  mapActionText: { color: Colors.white, fontWeight: '900', fontSize: 13 },
  finishAction: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, backgroundColor: Colors.success, paddingVertical: 14, borderRadius: 16 
  },
  finishActionText: { color: Colors.white, fontWeight: '900', fontSize: 13 },

  logsMeta: { padding: 24, marginTop: 8 },
  metaTitle: { fontSize: 12, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1.5, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { 
    flex: 1, backgroundColor: Colors.white, borderRadius: 20, padding: 16, 
    borderWidth: 1.5, borderColor: Colors.grayLight, alignItems: 'center' 
  },
  statVal: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '700', marginTop: 2 },

  // ALERT OVERLAY
  alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  alertCard: { 
    backgroundColor: Colors.white, borderRadius: 32, padding: 24,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 20
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  alertIconBg: { width: 56, height: 56, borderRadius: 20, backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center' },
  alertHeaderInfo: { flex: 1 },
  alertMajor: { fontSize: 20, fontWeight: '900', color: Colors.danger, letterSpacing: -0.5 },
  alertSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  alertTimer: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.grayLight, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
  alertInfoBox: { backgroundColor: Colors.grayLight, borderRadius: 20, padding: 20, marginBottom: 32 },
  alertData: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  alertVal: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  alertActions: { flexDirection: 'row', gap: 12 },
  declineAction: { flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 16, backgroundColor: Colors.grayLight },
  declineText: { fontSize: 15, fontWeight: '800', color: Colors.textSecondary },
  acceptAction: { 
    flex: 2, flexDirection: 'row', gap: 10, paddingVertical: 16, 
    alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.danger 
  },
  acceptText: { fontSize: 15, fontWeight: '900', color: Colors.white },

  // OTP SHEET
  otpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  otpSheet: { 
    backgroundColor: Colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 32,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32
  },
  otpSheetTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  otpSheetInfo: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  otpHiddenInput: { 
     backgroundColor: Colors.grayLight, borderRadius: 20, height: 72, fontSize: 36, 
     fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', letterSpacing: 20, marginBottom: 32 
  },
  otpSheetActions: { flexDirection: 'row', gap: 12 },
  otpSheetCancel: { flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  otpSheetCancelText: { fontSize: 15, color: Colors.textTertiary, fontWeight: '800' },
  otpSheetConfirm: { flex: 2, backgroundColor: Colors.success, paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  otpSheetConfirmText: { fontSize: 15, color: Colors.white, fontWeight: '900' }
});

