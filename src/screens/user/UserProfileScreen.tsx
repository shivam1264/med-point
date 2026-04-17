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

export function UserProfileScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [eName, setEName] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eRelation, setERelation] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setBloodGroup(data.bloodGroup || '');
      setAddress(data.address || '');
      setEName(data.emergencyContact?.name || '');
      setEPhone(data.emergencyContact?.phone || '');
      setERelation(data.emergencyContact?.relation || '');
    } catch (err) {
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates = {
        name,
        email,
        bloodGroup,
        address,
        emergencyContact: {
          name: eName,
          phone: ePhone,
          relation: eRelation
        }
      };
      await profileService.updateProfile(updates);
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', msg);
    } finally {

      setSaving(false);
    }
  };

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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle" size={80} color="#C0392B" />
            </View>
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profilePhone}>{profile?.phone}</Text>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, isEditing && styles.saveBtn]} 
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
            >
              <Icon name={isEditing ? "check" : "pencil"} size={20} color="#fff" />
              <Text style={styles.actionBtnText}>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              <InputGroup label="Full Name" value={name} onChangeText={setName} editable={isEditing} icon="account" />
              <InputGroup label="Email Address" value={email} onChangeText={setEmail} editable={isEditing} icon="email" />
              <InputGroup label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} editable={isEditing} icon="water" placeholder="e.g. O+" />
              <InputGroup label="Address" value={address} onChangeText={setAddress} editable={isEditing} icon="map-marker" multiline />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.card}>
              <InputGroup label="Contact Person" value={eName} onChangeText={setEName} editable={isEditing} icon="account-alert" />
              <InputGroup label="Contact Phone" value={ePhone} onChangeText={setEPhone} editable={isEditing} icon="phone" keyboardType="phone-pad" />
              <InputGroup label="Relation" value={eRelation} onChangeText={setERelation} editable={isEditing} icon="account-heart" />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Icon name="logout" size={20} color="#C0392B" />
            <Text style={styles.logoutText}>Sign Out from MedFlow</Text>
          </TouchableOpacity>
          
          <Text style={styles.version}>Version 1.0.2 · Powered by MedFlow</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputGroup({ label, value, onChangeText, editable, icon, placeholder, keyboardType, multiline }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
        <Icon name={icon} size={20} color={editable ? "#C0392B" : "#555"} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline && { height: 60, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#444"
          keyboardType={keyboardType}
          multiline={multiline}
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
    alignItems: 'center', marginBottom: 12, elevation: 5
  },
  profileName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profilePhone: { fontSize: 14, color: '#888', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  actionBtn: {
    flex: 1, flexDirection: 'row', backgroundColor: '#2A2A2A',
    borderRadius: 12, paddingVertical: 12, justifyContent: 'center',
    alignItems: 'center', gap: 8
  },
  saveBtn: { backgroundColor: '#27AE60' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { backgroundColor: '#333', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  cancelBtnText: { color: '#888', fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#888', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#555', fontWeight: '700', marginBottom: 6, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D0D0D', borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 12
  },
  disabledInput: { opacity: 0.6, backgroundColor: '#000' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, height: 45 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, marginTop: 10
  },
  logoutText: { color: '#C0392B', fontWeight: '700', fontSize: 16 },
  version: { textAlign: 'center', color: '#333', fontSize: 12, marginTop: 20 }
});
