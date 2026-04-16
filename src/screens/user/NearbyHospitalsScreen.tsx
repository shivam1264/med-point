import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, StatusBar, PermissionsAndroid, Platform, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import hospitalService from '../../services/hospitalService';
import type { Hospital } from '../../types';

const statusConfig = {
  green: { label: 'Available', color: '#27AE60', bg: '#0D2818' },
  amber: { label: 'Moderate', color: '#F39C12', bg: '#2A1A00' },
  red:   { label: 'Critical', color: '#C0392B', bg: '#2A0A0A' },
};

export function NearbyHospitalsScreen({ navigation }: any) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);

  const [isSOSMode, setIsSOSMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Get params from the current route
      const state = navigation.getState();
      const currentRoute = state?.routes?.find((r: any) => r.name === 'Hospitals');
      const params = currentRoute?.params as any;
      
      if (params?.isEmergency) {
        setIsSOSMode(true);
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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
      const data = await hospitalService.getNearbyHospitals(lat, lng, useSOS ? 5 : 20, useSOS);
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
        '🚑 Booking Confirmed!',
        `Ambulance from ${hospital.hospitalName} is being dispatched.\n\nDriver: ${result.data.ambulanceDriverName || 'Assigning...'}`,
        [{ text: 'Great', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Ambulance booking failed. Try another hospital.';
      Alert.alert('Booking Failed', msg);
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
    const eta = item.distanceKm ? Math.round(item.distanceKm * 3) : null; // ~3 min/km

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
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
          {item.emergency && (
            <View style={styles.metaItem}>
              <Icon name="alert-circle" size={14} color="#C0392B" />
              <Text style={[styles.metaText, { color: '#C0392B' }]}>24/7 Emergency</Text>
            </View>
          )}
        </View>

        {/* Beds */}
        <View style={styles.bedsRow}>
          <View style={styles.bedItem}>
            <Text style={styles.bedNum}>{item.icuAvailable ?? '?'}</Text>
            <Text style={styles.bedLabel}>ICU Free</Text>
            <Text style={styles.bedTotal}>/ {item.icuBeds}</Text>
          </View>
          <View style={styles.bedDivider} />
          <View style={styles.bedItem}>
            <Text style={styles.bedNum}>{item.availableBeds ?? '?'}</Text>
            <Text style={styles.bedLabel}>General Free</Text>
            <Text style={styles.bedTotal}>/ {item.totalBeds}</Text>
          </View>
          <View style={styles.bedDivider} />
          <View style={styles.bedItem}>
            <Text style={styles.bedNum}>{item.ventilatorsAvailable ?? '?'}</Text>
            <Text style={styles.bedLabel}>Ventilators</Text>
            <Text style={styles.bedTotal}>/ {item.ventilators}</Text>
          </View>
        </View>

        {/* Specialties */}
        {item.specialties && item.specialties.length > 0 && (
          <View style={styles.specRow}>
            {item.specialties.slice(0, 3).map((s, i) => (
              <View key={i} style={styles.specChip}>
                <Text style={styles.specText}>{s}</Text>
              </View>
            ))}
            {item.specialties.length > 3 && (
              <Text style={styles.specMore}>+{item.specialties.length - 3} more</Text>
            )}
          </View>
        )}

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
      <View style={[styles.headerBar, isSOSMode && styles.emergencyHeader]}>
        <Text style={styles.title}>{isSOSMode ? '🆘 Suggested Hospitals' : 'Nearest Hospitals'}</Text>
        <Text style={styles.subtitle}>
          {isSOSMode 
            ? 'Top 5 hospitals with available beds nearest to you' 
            : 'Top 20 hospitals sorted by distance • Live bed count'
          }
        </Text>
      </View>
      <FlatList
        data={hospitals}
        keyExtractor={(item) => item._id}
        renderItem={renderHospital}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  headerBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  card: {
    backgroundColor: '#1A1A1A', borderRadius: 16,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2A'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rankBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#C0392B20', alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
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
});
