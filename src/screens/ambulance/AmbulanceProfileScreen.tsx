import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
  StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';

export function AmbulanceProfileScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states (No longer editable)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setName(data.driverName || '');
      setPhone(data.driverPhone || '');
    } catch (err) {
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  // handleSave removed - drivers cannot edit profile


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C0392B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="ambulance" size={60} color="#C0392B" />
          </View>
          <Text style={styles.profileName}>{profile?.driverName}</Text>
          <Text style={styles.profileId}>Driver ID: {profile?.driverId}</Text>
        </View>

        {/* Action Row - Edit removed */}


        {/* Professional Details Section (Read-Only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working At</Text>
          <View style={styles.card}>
             <DetailRow icon="hospital-building" label="Hospital" value={profile?.hospitalName || 'Not Linked'} />
             <DetailRow icon="car-info" label="Vehicle Number" value={profile?.vehicleNumber} />
             <DetailRow icon="doctor" label="Vehicle Type" value={profile?.vehicleType} />
          </View>
        </View>

        {/* Personal Details Section (Read-Only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.card}>
            <DetailRow icon="account" label="Display Name" value={name} />
            <DetailRow icon="phone" label="Contact Phone" value={phone} />
          </View>
        </View>


        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>0</Text>
              <Text style={styles.statLab}>Trips</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>4.8</Text>
              <Text style={styles.statLab}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>$0</Text>
              <Text style={styles.statLab}>Earnings</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icon name="logout" size={20} color="#C0392B" />
          <Text style={styles.logoutText}>Sign Out from Driver Portal</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Driver Application · V 1.0.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={20} color="#888" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function InputGroup({ label, value, onChangeText, editable, icon, keyboardType }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
        <Icon name={icon} size={20} color={editable ? "#C0392B" : "#555"} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#444"
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1A1A1A', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#C0392B40'
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileId: { fontSize: 13, color: '#C0392B', fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  actionBtn: {
    flex: 1, flexDirection: 'row', backgroundColor: '#C0392B20',
    borderRadius: 12, paddingVertical: 12, justifyContent: 'center',
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#C0392B40'
  },
  saveBtn: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#555', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailLabel: { fontSize: 11, color: '#555', fontWeight: '700', textTransform: 'uppercase' },
  detailValue: { fontSize: 15, color: '#fff', fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, color: '#555', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D0D0D', borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 12
  },
  disabledInput: { opacity: 0.6, backgroundColor: '#000' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, height: 45 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#1A1A1A', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLab: { fontSize: 11, color: '#555', marginTop: 2, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, marginTop: 10
  },
  logoutText: { color: '#C0392B', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 20 }
});
