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

export function AmbulanceProfileScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
           <View style={styles.avatarWrapper}>
              <View style={styles.avatarBg}>
                 <Icon name="account-tie-outline" size={50} color={Colors.white} />
              </View>
              <View style={styles.badge}>
                 <Icon name="check-decagram" size={18} color={Colors.white} />
              </View>
           </View>
           <Text style={styles.driverName}>{profile?.driverName}</Text>
           <Text style={styles.driverId}>ID: {profile?.driverId || '---'} • ACTIVE COMMANDER</Text>
        </View>

        {/* STATS OVERVIEW */}
        <View style={styles.statsContainer}>
           <View style={styles.statItem}>
              <Text style={styles.statVal}>08</Text>
              <Text style={styles.statLab}>Completed</Text>
           </View>
           <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statVal}>4.8</Text>
              <Text style={styles.statLab}>Rating</Text>
           </View>
           <View style={styles.statItem}>
              <Text style={styles.statVal}>120</Text>
              <Text style={styles.statLab}>Mins</Text>
           </View>
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ASSIGNED FACILITY</Text>
          <View style={styles.infoCard}>
             <DetailRow icon="hospital-building" label="Medical Center" value={profile?.hospitalName || 'Not Linked'} />
             <View style={styles.divider} />
             <DetailRow icon="car-emergency" label="Vehicle Number" value={profile?.vehicleNumber || '---'} />
             <View style={styles.divider} />
             <DetailRow icon="shield-cross" label="Specialization" value={profile?.vehicleType || 'Advanced Life Support'} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTACT INFORMATION</Text>
          <View style={styles.infoCard}>
            <DetailRow icon="phone-outline" label="Primary Contact" value={profile?.driverPhone || '---'} />
            <View style={styles.divider} />
            <DetailRow icon="email-outline" label="Official Email" value={profile?.email || 'N/A'} />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
           <Icon name="power" size={24} color={Colors.danger} />
           <Text style={styles.logoutButtonText}>Terminate Session</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
           <Text style={styles.versionText}>COMMANDER PORTAL • ENGINE V1.2.0</Text>
           <Text style={styles.legalText}>Managed by MedFlow Emergency Systems</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconBg}>
         <Icon name={icon} size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  
  header: { alignItems: 'center', marginTop: 30, marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatarBg: { 
    width: 96, height: 96, borderRadius: 48, 
    backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8
  },
  badge: { 
    position: 'absolute', bottom: 2, right: 2, 
    width: 28, height: 28, borderRadius: 14, 
    backgroundColor: Colors.success, borderWidth: 3, borderColor: Colors.white,
    alignItems: 'center', justifyContent: 'center'
  },
  driverName: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  driverId: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, marginTop: 4, letterSpacing: 1 },

  statsContainer: { 
    flexDirection: 'row', marginHorizontal: 24, paddingVertical: 20, 
    backgroundColor: Colors.grayLight, borderRadius: 24, marginBottom: 32 
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  statLab: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', marginTop: 2 },

  section: { marginHorizontal: 24, marginBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 2, marginBottom: 12 },
  infoCard: { 
    backgroundColor: Colors.white, borderRadius: 24, padding: 8,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  detailIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.grayLight, alignItems: 'center', justifyContent: 'center' },
  detailContent: { marginLeft: 16, flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, textTransform: 'uppercase' },
  detailValue: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1.5, backgroundColor: Colors.grayLight, marginHorizontal: 12 },

  logoutButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, marginTop: 10, paddingVertical: 18, borderRadius: 20,
    backgroundColor: Colors.danger + '10'
  },
  logoutButtonText: { fontSize: 15, fontWeight: '900', color: Colors.danger },

  footer: { marginTop: 40, alignItems: 'center' },
  versionText: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1 },
  legalText: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, fontWeight: '600' }
});

