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
import { Colors } from '../../constants/colors';

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
        bloodGroup: bloodGroup.toUpperCase().trim(),
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
        <ActivityIndicator size="large" color={Colors.danger} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Icon name="account" size={64} color={Colors.white} />
            </View>
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profilePhone}>UID: {profile?.phone}</Text>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, isEditing ? styles.saveBtn : styles.editBtn]} 
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
            >
              <Icon name={isEditing ? "check-all" : "account-edit-outline"} size={22} color={Colors.white} />
              <Text style={styles.actionBtnText}>{saving ? 'Updating...' : isEditing ? 'Save Changes' : 'Update Profile'}</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                 <Icon name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Form Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Information</Text>
            <View style={styles.card}>
              <InputGroup label="Full Name" value={name} onChangeText={setName} editable={isEditing} icon="account-outline" />
              <InputGroup label="Email ID" value={email} onChangeText={setEmail} editable={isEditing} icon="email-outline" />
              <InputGroup label="Blood Type" value={bloodGroup} onChangeText={setBloodGroup} editable={isEditing} icon="water-outline" placeholder="A+, B+, etc." />
              <InputGroup label="Residential Area" value={address} onChangeText={setAddress} editable={isEditing} icon="map-marker-outline" multiline />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Dispatch Detail</Text>
            <View style={styles.card}>
              <InputGroup label="Primary Guardian" value={eName} onChangeText={setEName} editable={isEditing} icon="shield-check-outline" />
              <InputGroup label="Guardian Phone" value={ePhone} onChangeText={setEPhone} editable={isEditing} icon="phone-outline" keyboardType="phone-pad" />
              <InputGroup label="Relation" value={eRelation} onChangeText={setERelation} editable={isEditing} icon="account-supervisor-outline" />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Icon name="logout-variant" size={22} color={Colors.danger} />
            <Text style={styles.logoutText}>Disconnect Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.version}>Version 1.2.0 • Secured by MedFlow</Text>
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
        <Icon name={icon} size={20} color={editable ? Colors.danger : Colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline && { height: 70, textAlignVertical: 'top', paddingTop: 12 }]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 },
  centered: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.danger, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 15, elevation: 8
  },
  profileName: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  profilePhone: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
  
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  actionBtn: {
    flex: 1, flexDirection: 'row',
    borderRadius: 16, paddingVertical: 16, justifyContent: 'center',
    alignItems: 'center', gap: 10
  },
  editBtn: { backgroundColor: Colors.info, shadowColor: Colors.info, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  saveBtn: { backgroundColor: Colors.success, shadowColor: Colors.success, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  actionBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  
  cancelBtn: { 
    width: 56, backgroundColor: Colors.grayLight, 
    borderRadius: 16, justifyContent: 'center',
    alignItems: 'center'
  },
  
  section: { marginBottom: 32 },
  sectionTitle: { 
    fontSize: 13, color: Colors.textTertiary, fontWeight: '800', 
    marginBottom: 16, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.2
  },
  card: { 
    backgroundColor: Colors.white, borderRadius: 24, 
    padding: 20, borderWidth: 1, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
  },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '800', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.grayLight, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.grayLight, paddingHorizontal: 16
  },
  disabledInput: { opacity: 0.7, backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, height: 52, fontWeight: '600' },
  
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 18, marginTop: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 18,
    borderWidth: 1.5, borderColor: 'rgba(211, 47, 47, 0.1)'
  },
  logoutText: { color: Colors.danger, fontWeight: '900', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  version: { textAlign: 'center', color: Colors.textTertiary, fontSize: 12, marginTop: 32, fontWeight: '700' }
});

