import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import type { AuthRole } from '../../types';

type Tab = 'user' | 'ambulance';

export function LoginScreen({ navigation }: any) {
  const { loginUser, loginAmbulance } = useAuth();
  const [tab, setTab] = useState<Tab>('user');
  // user fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  // ambulance fields
  const [driverId, setDriverId] = useState('');
  const [driverPass, setDriverPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (tab === 'user') {
        if (!phone.trim() || !password.trim()) {
          Alert.alert('Error', 'Please enter phone and password');
          return;
        }
        await loginUser(phone.trim(), password.trim());
      } else {
        if (!driverId.trim() || !driverPass.trim()) {
          Alert.alert('Error', 'Please enter Driver ID and password');
          return;
        }
        await loginAmbulance(driverId.trim(), driverPass.trim());
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Check credentials.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Icon name="shield-cross" size={40} color={Colors.white} />
            </View>
            <Text style={styles.appTitle}>MedFlow</Text>
            <Text style={styles.appSub}>Reliable Emergency Healthcare</Text>
          </View>

          {/* Role Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'user' && styles.tabActive]}
              onPress={() => setTab('user')}>
              <Icon name="account" size={18} color={tab === 'user' ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, tab === 'user' && styles.tabTextActive]}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'ambulance' && styles.tabActive]}
              onPress={() => setTab('ambulance')}>
              <Icon name="ambulance" size={18} color={tab === 'ambulance' ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, tab === 'ambulance' && styles.tabTextActive]}>Driver</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === 'user' ? (
              <>
                <View style={styles.inputWrap}>
                  <Icon name="phone" size={20} color={Colors.danger} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    placeholderTextColor={Colors.textTertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Icon name="lock" size={20} color={Colors.danger} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.gray} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputWrap}>
                  <Icon name="card-account-details" size={20} color={Colors.danger} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Driver ID (e.g. DRV-1234)"
                    placeholderTextColor={Colors.textTertiary}
                    value={driverId}
                    onChangeText={setDriverId}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Icon name="lock" size={20} color={Colors.danger} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textTertiary}
                    value={driverPass}
                    onChangeText={setDriverPass}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.gray} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.driverHint}>
                  Credentials assigned by your hospital admin.
                </Text>
              </>
            )}

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {tab === 'user' && (
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLinkText}>
                  Don't have an account? <Text style={styles.registerLinkBold}>Join now</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  logoIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12,
    elevation: 8,
  },
  appTitle: { fontSize: 34, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  appSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.grayLight,
    borderRadius: 16, padding: 5, marginBottom: 32
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 8
  },
  tabActive: { backgroundColor: Colors.danger, shadowColor: Colors.danger, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  tabText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: Colors.white },
  form: {},
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    marginBottom: 16, paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
  eyeBtn: { padding: 8 },
  driverHint: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 12, marginTop: -4, fontWeight: '500' },
  loginBtn: {
    backgroundColor: Colors.danger, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginTop: 12,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8
  },
  loginBtnText: { color: Colors.white, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  registerLink: { alignItems: 'center', marginTop: 24 },
  registerLinkText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  registerLinkBold: { color: Colors.danger, fontWeight: '800' },
});

