import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SectionList, ScrollView, Modal,
  ActivityIndicator, Alert, RefreshControl, StatusBar, PermissionsAndroid, Platform, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import hospitalService from '../../services/hospitalService';
import sosService from '../../services/sosService';
import type { Hospital } from '../../types';

const statusConfig = {
  green: { label: 'Available', color: '#27AE60', bg: '#0D2818' },
  amber: { label: 'Moderate', color: '#F39C12', bg: '#2A1A00' },
  red:   { label: 'Critical', color: '#C0392B', bg: '#2A0A0A' },
};

export function NearbyHospitalsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showSOSOverlay, setShowSOSOverlay] = useState(false);

  const [isSOSMode, setIsSOSMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Get params from the current route
      const state = navigation.getState();
      const currentRoute = state?.routes?.find((r: any) => r.name === 'Hospitals');
      const params = currentRoute?.params as any;
      
      if (params?.isEmergency) {
        setIsSOSMode(true);
        setShowSOSOverlay(true); // Show floating window
        // Clear param so next visit is normal
        navigation.setParams({ isEmergency: undefined });
        fetchLocation(true);
      } else {
        setIsSOSMode(false);
        fetchLocation(false);
      }
    }, [navigation])
  );

  const fetchLocation = async (overrideSOS?: boolean) => {
    const useSOS = overrideSOS !== undefined ? overrideSOS : isSOSMode;
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'MedFlow needs location access to find nearby hospitals and dispatch ambulances.',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocationError(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Location found: ${latitude}, ${longitude}`);
        setUserLat(latitude);
        setUserLng(longitude);
        fetchHospitals(latitude, longitude, useSOS);
      },
      (error) => {
        console.log('Location Error:', error);
        // Error code 2 is POSITION_UNAVAILABLE (GPS off)
        // Error code 3 is TIMEOUT
        if (error.code === 2) {
          Alert.alert('GPS Disabled', 'Please turn on your GPS from the notification panel.');
        } else if (error.code === 3) {
          // Retry with lower accuracy if high accuracy timed out
          fetchLocationLazy(useSOS);
          return;
        }
        setLocationError(true);
        setLoading(false);
        setRefreshing(false);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 10000 }
    );
  };

  const fetchLocationLazy = (useSOS: boolean) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        fetchHospitals(latitude, longitude, useSOS);
      },
      () => {
        setLocationError(true);
        setLoading(false);
        setRefreshing(false);
      },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  };

  const fetchHospitals = async (lat: number, lng: number, useSOS: boolean) => {
    try {
      // Fetch hospitals
      const data = await hospitalService.getNearbyHospitals(lat, lng, 50, useSOS);
      console.log(`🏥 Total Hospitals Found: ${data.length} (Requested 50)`);
      
      setHospitals(data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load hospitals. Make sure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookAmbulance = async (hospital: Hospital) => {
    setLoading(true);
    try {
      if (!userLat || !userLng) throw new Error('Location not found');
      const result = await sosService.triggerSOS(userLat, userLng, hospital._id);
      
      Alert.alert(
        '🚑 Request Sent!',
        `Your request has been sent to ${hospital.hospitalName}. We are notifying nearby drivers.\n\nYou will be able to track once a driver accepts.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.log('SOS Failure', err?.response?.data || err);
      const msg = err?.response?.data?.message || err.message || 'Ambulance booking failed. Try another hospital.';
      Alert.alert('Booking Failed', `Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLocation();
  };

  const handleNavigate = (hospital: Hospital) => {
    navigation.navigate('UserMap', { hospital, userLat, userLng });
  };

  const renderHospital = ({ item, index }: { item: Hospital; index: number }) => {
    const cfg = statusConfig[item.status] || statusConfig.green;
    const dist = item.distanceKm?.toFixed(1);
    const eta = item.distanceKm ? Math.round(item.distanceKm * 3) : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.hospitalName} numberOfLines={1}>{item.hospitalName}</Text>
            <Text style={styles.hospitalArea} numberOfLines={1}>{item.area || item.address}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Distance + ETA */}
        <View style={styles.metaRow}>
          {dist && (
            <View style={styles.metaItem}>
              <Icon name="map-marker-distance" size={14} color="#888" />
              <Text style={styles.metaText}>{dist} km away</Text>
            </View>
          )}
          {eta && (
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={14} color="#888" />
              <Text style={styles.metaText}>~{eta} min</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => handleBookAmbulance(item)}>
            <Icon name="ambulance" size={16} color="#fff" />
            <Text style={styles.navBtnText}>Book Ambulance</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}
            >
              <Icon name="phone" size={18} color="#C0392B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={() => handleNavigate(item)}>
              <Icon name="navigation" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C0392B" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Icon name="map-marker-off" size={48} color="#C0392B" />
          <Text style={styles.errorTitle}>Location Access Required</Text>
          <Text style={styles.errorSub}>Please enable GPS permission</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLocationError(false); setLoading(true); fetchLocation(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <View style={styles.headerBar}>
        <Text style={styles.title}>All Hospitals Nearby</Text>
        <Text style={styles.subtitle}>Showing all hospitals sorted by distance</Text>
      </View>
      <FlatList
        data={hospitals}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => renderHospital({ item, index })}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C0392B" />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Icon name="hospital" size={48} color="#444" />
            <Text style={styles.emptyText}>No hospitals found nearby</Text>
          </View>
        }
      />

      {/* Floating SOS Overlay */}
      <Modal
        visible={showSOSOverlay}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSOSOverlay(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSOSOverlay(false)}
        >
          <View style={styles.floatingWindow}>
            <View style={styles.floatingHeader}>
              <View style={styles.floatingTitleWrapper}>
                <Icon name="star" size={20} color="#F39C12" />
                <Text style={styles.floatingTitle}>AI Top Recommended</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSOSOverlay(false)} style={styles.closeBtn}>
                <Icon name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.floatingSub}>Fastest response & high bed availability</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.floatingList}>
              {hospitals.slice(0, 5).map((h, i) => (
                <TouchableOpacity 
                  key={h._id} 
                  style={styles.floatingCard}
                  onPress={() => {
                    setShowSOSOverlay(false);
                    handleBookAmbulance(h);
                  }}
                >
                  <View style={styles.floatingCardHeader}>
                    <Text style={styles.floatingCardName} numberOfLines={1}>{h.hospitalName}</Text>
                    <View style={styles.statusDotLine}>
                      <View style={[styles.statusDot, { backgroundColor: statusConfig[h.status]?.color || '#27AE60' }]} />
                    </View>
                  </View>
                  <Text style={styles.floatingCardDist}>{h.distanceKm?.toFixed(1)} km · {Math.round(h.distanceKm! * 3)} min</Text>
                  <View style={styles.floatingCardBeds}>
                    <Icon name="bed-outline" size={14} color="#aaa" />
                    <Text style={styles.floatingBedText}>{h.availableBeds} Free</Text>
                  </View>
                  <View style={styles.sosGoBtn}>
                    <Text style={styles.sosGoText}>BOOK NOW</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.seeFullBtn} onPress={() => setShowSOSOverlay(false)}>
              <Text style={styles.seeFullText}>View All Hospitals</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  headerBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  list: { paddingBottom: 32 },
  sectionHeader: { 
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 28, paddingBottom: 14, backgroundColor: '#0D0D0D' 
  },
  recommendedHeader: { borderBottomWidth: 0 },
  othersHeader: { borderTopWidth: 1, borderTopColor: '#222', marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#888', letterSpacing: 1.5, textTransform: 'uppercase' },
  aiBadge: { 
    position: 'absolute', top: -10, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#C0392B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 8
  },
  aiBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  card: {
    backgroundColor: '#1A1A1A', borderRadius: 16, marginHorizontal: 16,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A'
  },
  recommendedCard: {
    borderColor: '#C0392B66', borderWidth: 1.5, backgroundColor: '#1E1414',
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rankBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
  recommendedRankBadge: { backgroundColor: '#C0392B20' },
  rankText: { fontSize: 13, fontWeight: '700', color: '#C0392B' },
  cardInfo: { flex: 1 },
  hospitalName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  hospitalArea: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#888' },
  bedsRow: {
    flexDirection: 'row', backgroundColor: '#0D0D0D',
    borderRadius: 10, padding: 12, marginBottom: 10
  },
  bedItem: { flex: 1, alignItems: 'center' },
  bedNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bedLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  bedTotal: { fontSize: 10, color: '#555' },
  bedDivider: { width: 1, backgroundColor: '#2A2A2A', marginHorizontal: 4 },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  specChip: {
    backgroundColor: '#2A2A2A', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3
  },
  specText: { fontSize: 11, color: '#aaa' },
  specMore: { fontSize: 11, color: '#888', alignSelf: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: '#C0392B', borderRadius: 10, paddingVertical: 10
  },
  callBtnText: { color: '#C0392B', fontWeight: '600', fontSize: 14 },
  emergencyHeader: { backgroundColor: '#2A0A0A', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#C0392B' },
  bookBtn: {
    flex: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#27AE60', borderRadius: 10, paddingVertical: 10
  },
  secondaryActions: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 10,
  },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#C0392B', borderRadius: 10, paddingVertical: 10
  },
  navBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  loadingText: { color: '#888', fontSize: 14, marginTop: 12 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  errorSub: { fontSize: 13, color: '#888' },
  retryBtn: { backgroundColor: '#C0392B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#888', fontSize: 14 },

  // Floating Window Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  floatingWindow: {
    backgroundColor: '#111',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, paddingTop: 10,
    borderWidth: 1, borderColor: '#C0392B44',
  },
  floatingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  floatingTitleWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  floatingTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  floatingSub: { fontSize: 13, color: '#888', marginBottom: 20, marginLeft: 28 },
  closeBtn: { padding: 8 },
  floatingList: { paddingBottom: 10, gap: 15 },
  floatingCard: {
    width: 200, backgroundColor: '#1E1414', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: '#C0392B33',
    elevation: 4
  },
  floatingCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  floatingCardName: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  floatingCardDist: { fontSize: 12, color: '#aaa', marginBottom: 12 },
  floatingCardBeds: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  floatingBedText: { fontSize: 12, color: '#888' },
  sosGoBtn: { backgroundColor: '#C0392B', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  sosGoText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  seeFullBtn: { marginTop: 15, paddingVertical: 12, alignItems: 'center' },
  seeFullText: { color: '#666', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  statusDotLine: { marginLeft: 8 },
  emptyOthers: { paddingVertical: 20, alignItems: 'center' },
  emptyOthersText: { color: '#444', fontSize: 12, fontStyle: 'italic' },
});
