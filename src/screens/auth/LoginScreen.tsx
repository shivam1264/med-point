import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthRole } from '../../types';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';

const ROLES: AuthRole[] = ['ambulance', 'family'];

export function LoginScreen() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    if (!selectedRole) {
      Alert.alert(Labels.login, 'Please select a role.');
      return;
    }
    if (!userId.trim() || !password.trim()) {
      Alert.alert(Labels.login, 'Please enter ID and password.');
      return;
    }
    login(selectedRole, userId.trim());
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <View style={styles.logoSquare}>
            <Icon name="shield-cross" size={28} color={Colors.white} />
          </View>
          <Text style={styles.appName}>{Labels.appName}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select role</Text>
        <View style={styles.roleGrid}>
          {ROLES.map(role => {
            const selected = selectedRole === role;
            return (
              <Pressable
                key={role}
                onPress={() => setSelectedRole(role)}
                style={[
                  styles.roleCard,
                  selected && { borderColor: Colors.danger, borderWidth: 2 },
                ]}>
                <Text style={styles.roleLabel}>{Labels.roleTitle(role)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>{Labels.employeeIdLabel}</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="ID"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>{Labels.passwordLabel}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry
        />

        <Pressable style={styles.loginBtn} onPress={onLogin}>
          <Text style={styles.loginBtnText}>{Labels.login}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { ...Typography.h1, color: Colors.textPrimary, marginTop: 10 },
  sectionTitle: { ...Typography.h3, color: Colors.textSecondary, marginBottom: 10 },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  roleCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  roleLabel: { ...Typography.body, color: Colors.textPrimary, textAlign: 'center' },
  inputLabel: { ...Typography.small, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  loginBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: { ...Typography.h3, color: Colors.white },
});
