import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../context/AuthContext';
import type { AuthRole } from '../../types';

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

  const initials = useMemo(() => {
    const parts = Labels.profileName.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>{Labels.settings}</Text>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{Labels.profileName}</Text>
            <Text style={styles.role}>{roleLine(role)}</Text>
            <View style={styles.shiftPill}>
              <Text style={styles.shiftText}>{Labels.onShift}</Text>
            </View>
          </View>
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
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
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
