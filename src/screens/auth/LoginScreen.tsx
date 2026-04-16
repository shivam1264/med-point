import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
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
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Icon name="shield-cross" size={36} color="#fff" />
            </View>
            <Text style={styles.appTitle}>MedFlow</Text>
            <Text style={styles.appSub}>Emergency Healthcare System</Text>
          </View>

          {/* Role Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'user' && styles.tabActive]}
              onPress={() => setTab('user')}>
              <Icon name="account" size={20} color={tab === 'user' ? '#fff' : '#888'} />
              <Text style={[styles.tabText, tab === 'user' && styles.tabTextActive]}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'ambulance' && styles.tabActive]}
              onPress={() => setTab('ambulance')}>
              <Icon name="ambulance" size={20} color={tab === 'ambulance' ? '#fff' : '#888'} />
              <Text style={[styles.tabText, tab === 'ambulance' && styles.tabTextActive]}>Ambulance Driver</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === 'user' ? (
              <>
                <View style={styles.inputWrap}>
                  <Icon name="phone" size={20} color="#C0392B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mobile Number"
                    placeholderTextColor="#555"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Icon name="lock" size={20} color="#C0392B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#555"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputWrap}>
                  <Icon name="card-account-details" size={20} color="#C0392B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Driver ID (e.g. DRV-1234)"
                    placeholderTextColor="#555"
                    value={driverId}
                    onChangeText={setDriverId}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Icon name="lock" size={20} color="#C0392B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#555"
                    value={driverPass}
                    onChangeText={setDriverPass}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={20} color="#555" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.driverHint}>
                  Credentials are assigned by your Hospital Admin
                </Text>
              </>
            )}

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {tab === 'user' && (
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLinkText}>
                  New patient? <Text style={styles.registerLinkBold}>Register here</Text>
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
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#C0392B',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12,
    elevation: 8,
  },
  appTitle: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  appSub: { fontSize: 13, color: '#888', marginTop: 4 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#1A1A1A',
    borderRadius: 14, padding: 4, marginBottom: 28
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10, gap: 6
  },
  tabActive: { backgroundColor: '#C0392B' },
  tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  form: {},
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
    marginBottom: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  driverHint: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 8, marginTop: -4 },
  loginBtn: {
    backgroundColor: '#C0392B', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#C0392B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6
  },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerLinkText: { color: '#888', fontSize: 14 },
  registerLinkBold: { color: '#C0392B', fontWeight: '700' },
});
