import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import doctorService from '../../services/doctorService';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import type { Doctor } from '../../types';

const specialties = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Gynecology', 'General Surgery'];

const statusConfig = {
  'available': { icon: 'check-circle', color: Colors.success, label: 'Available' },
  'busy':      { icon: 'clock-alert', color: Colors.warning, label: 'On Call' },
  'off-duty':  { icon: 'minus-circle', color: Colors.textTertiary, label: 'Offline' },
};

export function DoctorScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = doctors;
    if (selectedSpec !== 'All') {
      result = result.filter(d => d.specialty.toLowerCase().includes(selectedSpec.toLowerCase()));
    }
    if (search.trim()) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        (d.hospitalName || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [doctors, search, selectedSpec]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
      setFiltered(data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const renderDoctor = ({ item }: { item: Doctor }) => {
    const status = statusConfig[item.availableStatus as keyof typeof statusConfig] || statusConfig['off-duty'];
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: Colors.info + '10' }]}>
            <Icon name="doctor" size={32} color={Colors.info} />
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.docName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '10' }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.specialty}>{item.specialty}</Text>
          
          <View style={styles.infoGrid}>
            {item.hospitalName && (
              <View style={styles.infoRow}>
                <Icon name="hospital-building" size={14} color={Colors.textTertiary} />
                <Text style={styles.infoText} numberOfLines={1}>{item.hospitalName}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              {item.experience !== undefined && (
                <View style={styles.metaItem}>
                  <Icon name="briefcase-outline" size={13} color={Colors.textTertiary} />
                  <Text style={styles.metaText}>{item.experience}y Exp</Text>
                </View>
              )}
              {item.consultationFee !== undefined && item.consultationFee > 0 && (
                <Text style={styles.fee}>₹{item.consultationFee}</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.title}>Specialists</Text>
          <Text style={styles.subtitle}>Find expert medical care</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
           <Icon name="tune-vertical" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrap}>
          <Icon name="magnify" size={22} color={Colors.textTertiary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, clinic or specialty..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Specialty chips */}
      <View style={styles.specListContainer}>
        <FlatList
          horizontal
          data={specialties}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedSpec === item && styles.chipActive]}
              onPress={() => setSelectedSpec(item)}>
              <Text style={[styles.chipText, selectedSpec === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Coordinating with clinics...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderDoctor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <View style={styles.emptyIcon}>
                <Icon name="doctor" size={48} color={Colors.grayLight} />
              </View>
              <Text style={styles.emptyTitle}>No Specialists Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  headerBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 20 
  },
  title: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textTertiary, marginTop: 2, fontWeight: '600' },
  filterBtn: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center'
  },

  searchContainer: { paddingHorizontal: 24, marginBottom: 20 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.grayLight, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 4,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },

  specListContainer: { height: 46, marginBottom: 24 },
  chips: { paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  chip: {
    backgroundColor: Colors.grayLight, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  chipActive: { 
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3
  },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' },
  chipTextActive: { color: Colors.white, fontWeight: '800' },


  list: { paddingHorizontal: 24, paddingBottom: 40 },
  card: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: 24, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10
  },
  cardLeft: { marginRight: 16, position: 'relative' },
  avatar: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center'
  },
  statusIndicator: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: Colors.white
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  docName: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  specialty: { fontSize: 13, color: Colors.primary, fontWeight: '700', marginBottom: 10 },
  
  infoGrid: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
  fee: { fontSize: 14, color: Colors.success, fontWeight: '800' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { color: Colors.textTertiary, fontSize: 14, marginTop: 16, fontWeight: '600' },
  emptyIcon: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },
});

