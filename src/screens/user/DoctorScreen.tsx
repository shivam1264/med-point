import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import doctorService from '../../services/doctorService';
import type { Doctor } from '../../types';

const specialties = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Gynecology', 'General Surgery'];

const statusConfig = {
  'available': { icon: 'check-circle', color: '#27AE60', label: 'Available' },
  'busy':      { icon: 'clock-alert', color: '#F39C12', label: 'Busy' },
  'off-duty':  { icon: 'minus-circle', color: '#888', label: 'Off Duty' },
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
    const status = statusConfig[item.availableStatus] || statusConfig['off-duty'];
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Icon name="doctor" size={28} color="#C0392B" />
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.docName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Icon name={status.icon} size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.specialty}>{item.specialty}</Text>
          {item.hospitalName && (
            <View style={styles.infoRow}>
              <Icon name="hospital-building" size={13} color="#888" />
              <Text style={styles.infoText}>{item.hospitalName}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            {item.experience !== undefined && (
              <View style={styles.metaItem}>
                <Icon name="briefcase-outline" size={12} color="#666" />
                <Text style={styles.metaText}>{item.experience} yrs exp</Text>
              </View>
            )}
            {item.qualification && (
              <View style={styles.metaItem}>
                <Icon name="school" size={12} color="#666" />
                <Text style={styles.metaText}>{item.qualification}</Text>
              </View>
            )}
          </View>
          {item.consultationFee !== undefined && item.consultationFee > 0 && (
            <Text style={styles.fee}>₹{item.consultationFee} consultation</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.title}>Doctors</Text>
        <Text style={styles.subtitle}>Find specialists near you</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, specialty..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Specialty chips */}
      <View style={styles.specListContainer}>
        <FlatList
          horizontal
          data={specialties}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
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
          <ActivityIndicator size="large" color="#C0392B" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
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
              <Icon name="doctor" size={48} color="#333" />
              <Text style={styles.emptyText}>No doctors found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  headerBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12,
    marginHorizontal: 16, marginBottom: 8,
    paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: '#2A2A2A'
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 10 },
  specListContainer: { height: 50, marginBottom: 12 },
  chips: { paddingHorizontal: 16, alignItems: 'center' },
  chip: {
    backgroundColor: '#1A1A1A', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: '#2A2A2A',
    height: 38, justifyContent: 'center', alignItems: 'center'
  },
  chipActive: { backgroundColor: '#C0392B', borderColor: '#C0392B' },
  chipText: { fontSize: 13, color: '#888', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  card: {
    flexDirection: 'row', backgroundColor: '#1A1A1A',
    borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2A2A'
  },
  cardLeft: { marginRight: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#2A1A1A', alignItems: 'center', justifyContent: 'center'
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  docName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff', marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  specialty: { fontSize: 13, color: '#C0392B', fontWeight: '600', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  infoText: { fontSize: 12, color: '#888', flex: 1 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#666' },
  fee: { fontSize: 12, color: '#27AE60', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  emptyText: { color: '#888', fontSize: 14 },
});
