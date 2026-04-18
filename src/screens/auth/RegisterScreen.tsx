import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

export function RegisterScreen({ navigation }: any) {
  const { registerUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name: name.trim(), phone: phone.trim(), password });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Icon name="account-plus" size={36} color={Colors.white} />
            </View>
            <Text style={styles.title}>New Entry</Text>
            <Text style={styles.sub}>Register to access emergency services</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Icon name="account" size={20} color={Colors.danger} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputWrap}>
              <Icon name="phone" size={20} color={Colors.danger} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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
            <View style={styles.inputWrap}>
              <Icon name="lock-check" size={20} color={Colors.danger} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showPass}
              />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.registerBtnText}>Join MedFlow</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 40 },
  backBtn: { 
    width: 44, height: 44, borderRadius: 12, 
    backgroundColor: Colors.grayLight, alignItems: 'center', 
    justifyContent: 'center', marginBottom: 24 
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4
  },
  title: { fontSize: 30, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center', fontWeight: '500' },
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
  registerBtn: {
    backgroundColor: Colors.danger, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginTop: 12,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8
  },
  registerBtnText: { color: Colors.white, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  loginLink: { alignItems: 'center', marginTop: 24 },
  loginLinkText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  loginLinkBold: { color: Colors.danger, fontWeight: '800' },
});

