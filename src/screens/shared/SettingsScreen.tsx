import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';
import type { AuthRole } from '../../types';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  zone: string;
  language: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: Labels.profileName,
  email: 'amit.kumar@medflow.com',
  phone: '+91 98765 43210',
  zone: Labels.zoneCentral,
  language: 'Hindi / English',
};

function roleLine(role: AuthRole | null) {
  if (!role) {
    return '';
  }
  return `${Labels.roleTitle(role)} · ${Labels.zone}`;
}

export function SettingsScreen() {
  const { logout, role } = useAuth();
  const [criticalOn, setCriticalOn] = useState(true);
  const [caseUpdatesOn, setCaseUpdatesOn] = useState(true);
  const [shiftOn, setShiftOn] = useState(false);
  
  // Profile state management
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [tempProfile, setTempProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const initials = useMemo(() => {
    const parts = (isEditMode ? tempProfile.name : profile.name).split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }, [isEditMode, tempProfile.name, profile.name]);

  const handleEditProfile = () => {
    setTempProfile(profile);
    setIsEditMode(true);
  };

  const handleSaveProfile = () => {
    // Validate profile data
    if (!tempProfile.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!tempProfile.email.trim() || !tempProfile.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!tempProfile.phone.trim() || tempProfile.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Save profile (in real app, this would call API)
    setProfile(tempProfile);
    setIsEditMode(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleCancelEdit = () => {
    setTempProfile(profile);
    setIsEditMode(false);
  };

  const updateTempProfile = (field: keyof UserProfile, value: string) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>{Labels.settings}</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileText}>
                {isEditMode ? (
                  <TextInput
                    style={styles.nameInput}
                    value={tempProfile.name}
                    onChangeText={(value) => updateTempProfile('name', value)}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.textTertiary}
                  />
                ) : (
                  <Text style={styles.name}>{profile.name}</Text>
                )}
                <Text style={styles.role}>{roleLine(role)}</Text>
                <View style={styles.shiftPill}>
                  <Text style={styles.shiftText}>{Labels.onShift}</Text>
                </View>
              </View>
            </View>
            <View style={styles.editActions}>
              {isEditMode ? (
                <View style={styles.editButtons}>
                  <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSaveProfile}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.editButton} onPress={handleEditProfile}>
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </Pressable>
              )}
            </View>
          </View>
          
          {isEditMode && (
            <View style={styles.editableFields}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={tempProfile.email}
                  onChangeText={(value) => updateTempProfile('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={tempProfile.phone}
                  onChangeText={(value) => updateTempProfile('phone', value)}
                  placeholder="Enter your phone"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Zone</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={tempProfile.zone}
                  onChangeText={(value) => updateTempProfile('zone', value)}
                  placeholder="Enter your zone"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Language</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={tempProfile.language}
                  onChangeText={(value) => updateTempProfile('language', value)}
                  placeholder="Enter preferred language"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.section}>{Labels.notifications}</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{Labels.criticalAlerts}</Text>
            <Switch
              value={criticalOn}
              onValueChange={setCriticalOn}
              trackColor={{ true: Colors.danger, false: Colors.grayLight }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{Labels.caseUpdates}</Text>
            <Switch
              value={caseUpdatesOn}
              onValueChange={setCaseUpdatesOn}
              trackColor={{ true: Colors.danger, false: Colors.grayLight }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{Labels.shiftReminders}</Text>
            <Switch
              value={shiftOn}
              onValueChange={setShiftOn}
              trackColor={{ true: Colors.danger, false: Colors.grayLight }}
            />
          </View>
        </View>

        <Text style={styles.section}>{Labels.zoneAndLanguage}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.muted}>{Labels.zoneRow}</Text>
            <Text style={styles.value}>{Labels.zoneCentral}</Text>
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.muted}>{Labels.languageRow}</Text>
            <Text style={styles.value}>{Labels.languageDisplay}</Text>
          </View>
        </View>

        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>{Labels.logout}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  screenTitle: { ...Typography.h1, color: Colors.textPrimary, marginBottom: 16 },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  profileHeader: {
    marginBottom: 16,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  avatarText: { ...Typography.h3, color: Colors.infoDark },
  profileText: { marginLeft: 12, flex: 1 },
  name: { ...Typography.h2, color: Colors.textPrimary },
  nameInput: {
    ...Typography.h2,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 2,
  },
  role: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  shiftPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shiftText: { ...Typography.tiny, color: Colors.successDark, fontWeight: '600' },
  editActions: {
    alignItems: 'flex-end',
  },
  editButton: {
    backgroundColor: Colors.info,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    ...Typography.small,
    color: Colors.white,
    fontWeight: '600',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: Colors.success,
  },
  cancelButton: {
    backgroundColor: Colors.gray,
  },
  saveButtonText: {
    ...Typography.small,
    color: Colors.white,
    fontWeight: '600',
  },
  cancelButtonText: {
    ...Typography.small,
    color: Colors.white,
    fontWeight: '600',
  },
  editableFields: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  fieldInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  section: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 8, marginTop: 8 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: { ...Typography.body, color: Colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { ...Typography.body, color: Colors.textSecondary },
  value: { ...Typography.body, color: Colors.textPrimary, fontWeight: '500' },
  logout: { marginTop: 24, alignItems: 'center', paddingVertical: 12 },
  logoutText: { ...Typography.h3, color: Colors.danger },
});
