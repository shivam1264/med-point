import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';

interface Hospital {
  id: string;
  name: string;
  distance: string;
  status: 'available' | 'limited';
  icuBeds: number;
  phone: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

interface Ambulance {
  id: string;
  status: string;
  route?: string;
  eta?: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export function MapScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'City General Hospital',
      distance: '2.3 km away',
      status: 'available',
      icuBeds: 12,
      phone: '+91 98765 43210',
      coordinate: { latitude: 28.6139, longitude: 77.2090 },
    },
    {
      id: '2',
      name: 'MediCare Center',
      distance: '4.1 km away',
      status: 'limited',
      icuBeds: 3,
      phone: '+91 98765 43211',
      coordinate: { latitude: 28.6200, longitude: 77.2150 },
    },
  ];

  const ambulances: Ambulance[] = [
    {
      id: 'AMB-001',
      status: 'On Route - Emergency',
      route: 'Main Street -> City Hospital',
      eta: 'ETA: 8 minutes',
      coordinate: { latitude: 28.6100, longitude: 77.2050 },
    },
    {
      id: 'AMB-002',
      status: 'Available',
      coordinate: { latitude: 28.6150, longitude: 77.2100 },
    },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location to show nearby hospitals',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => {
        console.log(error);
        Alert.alert('Error', 'Could not get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{Labels.map}</Text>
          <Text style={styles.subtitle}>Find nearby hospitals and track ambulances</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
          >
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                description="You are here"
                pinColor={Colors.info}
              />
            )}
            
            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={hospital.coordinate}
                title={hospital.name}
                description={`${hospital.distance} • ${hospital.icuBeds} ICU beds available`}
                pinColor={hospital.status === 'available' ? Colors.success : Colors.warning}
              />
            ))}
            
            {ambulances.map((ambulance) => (
              <Marker
                key={ambulance.id}
                coordinate={ambulance.coordinate}
                title={ambulance.id}
                description={ambulance.status}
                pinColor={Colors.info}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          <View style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <Icon name="hospital" size={24} color={Colors.danger} />
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>City General Hospital</Text>
                <Text style={styles.hospitalDistance}>2.3 km away</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Available</Text>
              </View>
            </View>
            <View style={styles.hospitalDetails}>
              <View style={styles.detailRow}>
                <Icon name="bed" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>12 ICU beds available</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="phone" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>+91 98765 43210</Text>
              </View>
            </View>
          </View>

          <View style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <Icon name="hospital" size={24} color={Colors.warning} />
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>MediCare Center</Text>
                <Text style={styles.hospitalDistance}>4.1 km away</Text>
              </View>
              <View style={styles.statusBadgeWarning}>
                <Text style={styles.statusTextWarning}>Limited</Text>
              </View>
            </View>
            <View style={styles.hospitalDetails}>
              <View style={styles.detailRow}>
                <Icon name="bed" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>3 ICU beds available</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="phone" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>+91 98765 43211</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Ambulances</Text>
          <View style={styles.ambulanceCard}>
            <View style={styles.ambulanceHeader}>
              <Icon name="ambulance" size={24} color={Colors.success} />
              <View style={styles.ambulanceInfo}>
                <Text style={styles.ambulanceId}>AMB-001</Text>
                <Text style={styles.ambulanceStatus}>On Route - Emergency</Text>
              </View>
              <Icon name="navigation" size={20} color={Colors.success} />
            </View>
            <View style={styles.ambulanceDetails}>
              <Text style={styles.ambulanceRoute}>Route: Main Street {'->'} City Hospital</Text>
              <Text style={styles.ambulanceEta}>ETA: 8 minutes</Text>
            </View>
          </View>

          <View style={styles.ambulanceCard}>
            <View style={styles.ambulanceHeader}>
              <Icon name="ambulance" size={24} color={Colors.info} />
              <View style={styles.ambulanceInfo}>
                <Text style={styles.ambulanceId}>AMB-002</Text>
                <Text style={styles.ambulanceStatus}>Available</Text>
              </View>
              <Icon name="check-circle" size={20} color={Colors.info} />
            </View>
            <View style={styles.ambulanceDetails}>
              <Text style={styles.ambulanceRoute}>Location: Central Station</Text>
              <Text style={styles.ambulanceEta}>Ready for dispatch</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 20, paddingBottom: 20 },
  title: { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  mapContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 300,
    marginBottom: 20,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  section: { marginBottom: 30 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 15 },
  hospitalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalInfo: { flex: 1, marginLeft: 12 },
  hospitalName: { ...Typography.body, color: Colors.textPrimary },
  hospitalDistance: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { ...Typography.small, color: Colors.white },
  statusBadgeWarning: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTextWarning: { ...Typography.small, color: Colors.white },
  hospitalDetails: { gap: 8 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: { ...Typography.small, color: Colors.textSecondary, marginLeft: 8 },
  ambulanceCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  ambulanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ambulanceInfo: { flex: 1, marginLeft: 12 },
  ambulanceId: { ...Typography.body, color: Colors.textPrimary },
  ambulanceStatus: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  ambulanceDetails: { gap: 4 },
  ambulanceRoute: { ...Typography.small, color: Colors.textSecondary },
  ambulanceEta: { ...Typography.small, color: Colors.textSecondary },
});
