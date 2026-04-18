import React, { useMemo, useState } from 'react';
import { 
  Pressable, ScrollView, StyleSheet, Switch, Text, 
  TextInput, View, Alert, Platform, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AuthRole } from '../../types';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  zone: string;
  language: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Officer Amit Kumar',
  email: 'amit.kumar@medflow.com',
  phone: '+91 98765 43210',
  zone: 'Central Region',
  language: 'Hindi / English',
};

export function SettingsScreen() {
  const { logout, role } = useAuth();
  const [criticalOn, setCriticalOn] = useState(true);
  const [caseUpdatesOn, setCaseUpdatesOn] = useState(true);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [tempProfile, setTempProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const initials = useMemo(() => {
    const parts = (isEditMode ? tempProfile.name : profile.name).split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }, [isEditMode, tempProfile.name, profile.name]);

  const handleSaveProfile = () => {
    if (!tempProfile.name.trim()) return Alert.alert('Error', 'Name is required');
    setProfile(tempProfile);
    setIsEditMode(false);
    Alert.alert('Success', 'Profile updated');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
           <Text style={styles.screenTitle}>Settings</Text>
           <Text style={styles.screenSub}>Manage your profile and preferences</Text>
        </View>

        <View style={styles.profileSection}>
           <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                 <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <TouchableOpacity style={styles.avatarEdit} onPress={() => setIsEditMode(!isEditMode)}>
                 <Icon name={isEditMode ? "check" : "pencil"} size={16} color={Colors.white} />
              </TouchableOpacity>
           </View>
           
           <View style={styles.profileInfo}>
              {isEditMode ? (
                <TextInput
                  style={styles.nameInput}
                  value={tempProfile.name}
                  onChangeText={(v) => setTempProfile({...tempProfile, name: v})}
                  autoFocus
                />
              ) : (
                <Text style={styles.userName}>{profile.name}</Text>
              )}
              <Text style={styles.userRole}>{role?.toUpperCase() || 'USER'} · OPERATIONAL</Text>
           </View>
        </View>

        {isEditMode && (
          <View style={styles.editForm}>
             <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.email}
                  onChangeText={(v) => setTempProfile({...tempProfile, email: v})}
                  keyboardType="email-address"
                />
             </View>
             <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.phone}
                  onChangeText={(v) => setTempProfile({...tempProfile, phone: v})}
                  keyboardType="phone-pad"
                />
             </View>
             <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
             </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Preferences</Text>
           <View style={styles.card}>
              <View style={styles.row}>
                 <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: Colors.danger + '10' }]}>
                       <Icon name="bell-ring" size={20} color={Colors.danger} />
                    </View>
                    <Text style={styles.rowLabel}>Critical Alerts</Text>
                 </View>
                 <Switch 
                  value={criticalOn} 
                  onValueChange={setCriticalOn} 
                  trackColor={{ true: Colors.primary }} 
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                 <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: Colors.info + '10' }]}>
                       <Icon name="update" size={20} color={Colors.info} />
                    </View>
                    <Text style={styles.rowLabel}>Mission Updates</Text>
                 </View>
                 <Switch 
                  value={caseUpdatesOn} 
                  onValueChange={setCaseUpdatesOn} 
                  trackColor={{ true: Colors.primary }} 
                />
              </View>
           </View>
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Regional</Text>
           <View style={styles.card}>
              <View style={styles.staticRow}>
                 <Text style={styles.staticLabel}>Language</Text>
                 <Text style={styles.staticValue}>English / Hindi</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.staticRow}>
                 <Text style={styles.staticLabel}>Medical Zone</Text>
                 <Text style={styles.staticValue}>Central Region</Text>
              </View>
           </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
           <Icon name="logout" size={20} color={Colors.danger} />
           <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
           <Text style={styles.footerText}>MedFlow Premium v1.0.4</Text>
           <Text style={styles.legalText}>Licensed for emergency medical use only</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },
  header: { padding: 24, paddingTop: 16 },
  screenTitle: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary },
  screenSub: { fontSize: 13, color: Colors.textTertiary, marginTop: 4, fontWeight: '600' },

  profileSection: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: Colors.primary + '10', 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.white,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.primary },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white
  },
  profileInfo: { alignItems: 'center' },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  nameInput: { 
    fontSize: 20, fontWeight: '800', color: Colors.textPrimary, 
    borderBottomWidth: 1, borderBottomColor: Colors.primary, 
    minWidth: 200, textAlign: 'center', paddingVertical: 4
  },
  userRole: { fontSize: 12, fontWeight: '800', color: Colors.textTertiary, marginTop: 4, letterSpacing: 1 },

  editForm: { paddingHorizontal: 24, marginBottom: 32 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 10, fontWeight: '900', color: Colors.textTertiary, letterSpacing: 1, marginBottom: 8 },
  textInput: { 
    backgroundColor: Colors.grayLight, borderRadius: 16, padding: 16, 
    fontSize: 15, color: Colors.textPrimary, fontWeight: '600' 
  },
  saveBtn: { 
    backgroundColor: Colors.primary, borderRadius: 16, padding: 16, 
    alignItems: 'center', marginTop: 8 
  },
  saveBtnText: { color: Colors.white, fontWeight: '900', fontSize: 15 },

  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    backgroundColor: Colors.white, borderRadius: 24, padding: 8,
    borderWidth: 1.5, borderColor: Colors.grayLight
  },
  row: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 12, height: 64 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  divider: { height: 1.5, backgroundColor: Colors.grayLight, marginHorizontal: 12 },

  staticRow: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, height: 56 
  },
  staticLabel: { fontSize: 14, fontWeight: '700', color: Colors.textTertiary },
  staticValue: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },

  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, marginTop: 12, paddingVertical: 18, borderRadius: 20,
    backgroundColor: Colors.danger + '10' 
  },
  logoutText: { fontSize: 15, fontWeight: '900', color: Colors.danger },

  footer: { marginTop: 40, alignItems: 'center', paddingHorizontal: 24 },
  footerText: { fontSize: 12, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.5 },
  legalText: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, fontWeight: '600', textAlign: 'center' }
});
