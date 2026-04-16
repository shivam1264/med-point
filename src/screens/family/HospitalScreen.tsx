import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';
import { HospitalCard } from '../../components/HospitalCard';
import { hospitalService, type HospitalSearchParams } from '../../services/hospitalService';
import type { Hospital } from '../../types';

export function HospitalScreen() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'moderate' | 'full'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = async (params?: HospitalSearchParams) => {
    try {
      setError(null);
      const searchParams: HospitalSearchParams = {
        ...params,
        search: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      };
      
      const response = await hospitalService.getHospitals(searchParams);
      setHospitals(response.data);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load hospitals. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHospitals();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchHospitals();
  };

  const handleStatusFilter = (status: typeof selectedStatus) => {
    setSelectedStatus(status);
    setLoading(true);
    fetchHospitals({ status: status !== 'all' ? status : undefined });
  };

  const getHospitalIconColor = (status: string) => {
    switch (status) {
      case 'available':
        return Colors.success;
      case 'moderate':
        return Colors.warning;
      case 'full':
        return Colors.danger;
      default:
        return Colors.danger;
    }
  };

  const handleHospitalPress = (hospital: Hospital) => {
    Alert.alert(
      hospital.name,
      `Status: ${hospital.status}\nICU Beds: ${hospital.icuFree}/${hospital.icuTotal}\nGeneral Beds: ${hospital.generalFree}/${hospital.generalTotal}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Hospital', onPress: () => console.log('Call:', hospital.contact?.phone) },
        { text: 'Get Directions', onPress: () => console.log('Navigate to:', hospital.name) }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.danger} />
          <Text style={styles.loadingText}>Loading hospitals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hospitals</Text>
          <Text style={styles.subtitle}>Find and connect with medical facilities</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hospitals..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <Pressable style={styles.filterBtn}>
            <Icon name="filter" size={20} color={Colors.danger} />
          </Pressable>
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
              onPress={() => handleStatusFilter('all')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextActive]}>
                All
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterChip, selectedStatus === 'available' && styles.filterChipActive]}
              onPress={() => handleStatusFilter('available')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'available' && styles.filterChipTextActive]}>
                Available
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterChip, selectedStatus === 'moderate' && styles.filterChipActive]}
              onPress={() => handleStatusFilter('moderate')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'moderate' && styles.filterChipTextActive]}>
                Moderate
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterChip, selectedStatus === 'full' && styles.filterChipActive]}
              onPress={() => handleStatusFilter('full')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'full' && styles.filterChipTextActive]}>
                Full
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Hospitals ({hospitals.length})</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={24} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryBtn} onPress={onRefresh}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : hospitals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="hospital" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No hospitals found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onPress={() => handleHospitalPress(hospital)}
              />
            ))
          )}
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
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { ...Typography.body, color: Colors.textPrimary, marginLeft: 8, flex: 1 },
  filterBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  filterChipText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  section: { marginBottom: 30 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 15 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...Typography.body,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    ...Typography.body,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  hospitalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  hospitalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalIconWarning: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalIconSuccess: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalInfo: { flex: 1, marginLeft: 12 },
  hospitalName: { ...Typography.body, color: Colors.textPrimary },
  hospitalAddress: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: { ...Typography.small, color: Colors.textSecondary, marginLeft: 4 },
  distance: { ...Typography.small, color: Colors.textSecondary },
  hospitalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: { alignItems: 'center' },
  statNumber: { ...Typography.h3, color: Colors.textPrimary },
  statLabel: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  hospitalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  actionBtnText: { ...Typography.small, color: Colors.danger, marginLeft: 4 },
});
