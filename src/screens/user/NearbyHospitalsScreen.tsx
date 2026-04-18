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
import { Colors } from '../../constants/colors';
import type { Hospital } from '../../types';

const statusConfig = {
  green: { label: 'Available', color: Colors.success, bg: Colors.successLight },
  amber: { label: 'Busy', color: Colors.warning, bg: Colors.warningLight },
  red:   { label: 'Full', color: Colors.danger, bg: Colors.dangerLight },
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
      const state = navigation.getState();
      const currentRoute = state?.routes?.find((r: any) => r.name === 'Hospitals');
      const params = currentRoute?.params as any;
      
      if (params?.isEmergency) {
        setIsSOSMode(true);
        setShowSOSOverlay(true);
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
          message: 'MedFlow needs location access to find nearby hospitals.',
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
        setUserLat(latitude);
        setUserLng(longitude);
        fetchHospitals(latitude, longitude, useSOS);
      },
      (error) => {
        if (error.code === 2) {
          Alert.alert('GPS Disabled', 'Please turn on your GPS.');
        } else if (error.code === 3) {
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
      const data = await hospitalService.getNearbyHospitals(lat, lng, 30, useSOS);
      setHospitals(data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load hospitals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookAmbulance = async (hospital: Hospital) => {
    setLoading(true);
    try {
      if (!userLat || !userLng) throw new Error('Location not found');
      await sosService.triggerSOS(userLat, userLng, hospital._id);
      Alert.alert('🚑 SOS Active!', `Booking request sent to ${hospital.hospitalName}. Help is on the way.`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Booking failed.';
      Alert.alert('Error', msg);
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

  const renderHospital = ({ item }: { item: Hospital }) => {
    const cfg = statusConfig[item.status] || statusConfig.green;
    const dist = item.distanceKm?.toFixed(1);
    const eta = item.distanceKm ? Math.round(item.distanceKm * 4) : '--';

    return (
      <View style={styles.hospitalCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.hospitalName} numberOfLines={1}>{item.hospitalName}</Text>
            <Text style={styles.hospitalAddress} numberOfLines={1}>{item.area || item.address}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaTag}>
             <Icon name="map-marker-path" size={14} color={Colors.info} />
             <Text style={styles.metaTagText}>{dist} km away</Text>
          </View>
          <View style={styles.metaTag}>
             <Icon name="clock-outline" size={14} color={Colors.info} />
             <Text style={styles.metaTagText}>{eta} min • ETA</Text>
          </View>
          <View style={styles.metaTag}>
             <Icon name="bed-outline" size={14} color={Colors.info} />
             <Text style={styles.metaTagText}>{item.availableBeds} beds</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.mainAction} onPress={() => handleBookAmbulance(item)}>
            <Icon name="ambulance" size={18} color={Colors.white} />
            <Text style={styles.mainActionText}>Call Ambulance</Text>
          </TouchableOpacity>
          
          <View style={styles.sideActions}>
            <TouchableOpacity style={styles.sideBtn} onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}>
               <Icon name="phone" size={20} color={Colors.info} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sideBtn, { backgroundColor: Colors.info }]} onPress={() => handleNavigate(item)}>
               <Icon name="directions" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.danger} />
        <Text style={styles.loadingInfo}>Scanning medical facilities...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centered}>
        <Icon name="crosshairs-gps" size={60} color={Colors.gray} />
        <Text style={styles.errorTitle}>Location Required</Text>
        <Text style={styles.errorText}>Please enable GPS to find help.</Text>
        <TouchableOpacity style={styles.retryAction} onPress={() => { setLocationError(false); setLoading(true); fetchLocation(); }}>
          <Text style={styles.retryText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      <View style={styles.topBar}>
        <View>
          <Text style={styles.headerTitle}>Medical Centers</Text>
          <Text style={styles.headerSub}>Finding best care nearby</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
           <Icon name="tune" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={hospitals}
        keyExtractor={(item) => item._id}
        renderItem={renderHospital}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.danger} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="hospital-marker" size={50} color={Colors.grayLight} />
            <Text style={styles.emptyText}>No facilities found nearby.</Text>
          </View>
        }
      />

      {/* Floating Recommendation Overlay */}
      <Modal
        visible={showSOSOverlay}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSOSOverlay(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowSOSOverlay(false)} />
          <View style={styles.recommendationSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
               <View>
                 <Text style={styles.sheetTitle}>Best Emergency Care</Text>
                 <Text style={styles.sheetSub}>Optimized for response time & bed availability</Text>
               </View>
               <TouchableOpacity onPress={() => setShowSOSOverlay(false)} style={styles.closeSheet}>
                  <Icon name="close" size={24} color={Colors.textTertiary} />
               </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetTiles}>
              {hospitals.slice(0, 5).map((h) => (
                <TouchableOpacity 
                   key={h._id} 
                   style={styles.hospitalTile}
                   onPress={() => {
                     setShowSOSOverlay(false);
                     handleBookAmbulance(h);
                   }}
                >
                  <View style={styles.tileMain}>
                    <Text style={styles.tileName} numberOfLines={1}>{h.hospitalName}</Text>
                    <View style={styles.tileMetaRow}>
                       <Text style={styles.tileDist}>{h.distanceKm?.toFixed(1)} km</Text>
                       <View style={styles.tileDot} />
                       <Text style={styles.tileEta}>{Math.round(h.distanceKm! * 4)} min</Text>
                    </View>
                  </View>
                  <View style={styles.tileFooter}>
                     <View style={[styles.tileStatusIndicator, { backgroundColor: statusConfig[h.status]?.color || Colors.success }]} />
                     <Text style={styles.tileBedText}>{h.availableBeds} beds</Text>
                     <View style={styles.tileAction}>
                        <Text style={styles.tileActionText}>SELECT</Text>
                     </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.viewFullAction} onPress={() => setShowSOSOverlay(false)}>
               <Text style={styles.viewFullText}>Explore other facilities</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', padding: 30 },
  topBar: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.grayLight, alignItems: 'center', justifyContent: 'center' },

  listContainer: { padding: 20 },
  hospitalCard: {
    backgroundColor: Colors.white, borderRadius: 24, padding: 20, marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  titleArea: { flex: 1, marginRight: 10 },
  hospitalName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  hospitalAddress: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },

  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.infoLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  metaTagText: { fontSize: 12, color: Colors.info, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 12 },
  mainAction: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: Colors.success, borderRadius: 16, paddingVertical: 14, gap: 8 
  },
  mainActionText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  sideActions: { flexDirection: 'row', gap: 10 },
  sideBtn: { 
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.grayLight, 
    alignItems: 'center', justifyContent: 'center' 
  },

  loadingInfo: { marginTop: 16, fontSize: 13, color: Colors.textTertiary, fontWeight: '600' },
  errorTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, marginTop: 20 },
  errorText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  retryAction: { backgroundColor: Colors.info, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16, marginTop: 24 },
  retryText: { color: Colors.white, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: Colors.textTertiary, fontSize: 14, fontWeight: '600' },

  // Recommendation Sheet
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  recommendationSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: Colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  sheetSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', width: '85%', marginTop: 2 },
  closeSheet: { padding: 4 },

  sheetTiles: { gap: 16, paddingBottom: 10 },
  hospitalTile: {
    width: 240, backgroundColor: Colors.white, borderRadius: 28, padding: 20,
    borderWidth: 2, borderColor: Colors.dangerLight,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
  },
  tileMain: { marginBottom: 20 },
  tileName: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  tileMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  tileDist: { fontSize: 13, color: Colors.textTertiary, fontWeight: '700' },
  tileDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  tileEta: { fontSize: 13, color: Colors.danger, fontWeight: '800' },
  
  tileFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tileStatusIndicator: { width: 8, height: 8, borderRadius: 4 },
  tileBedText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, flex: 1 },
  tileAction: { backgroundColor: Colors.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  tileActionText: { color: Colors.white, fontSize: 11, fontWeight: '900' },

  viewFullAction: { marginTop: 20, paddingVertical: 12, alignItems: 'center' },
  viewFullText: { fontSize: 14, color: Colors.textTertiary, fontWeight: '700', textDecorationLine: 'underline' }
});

