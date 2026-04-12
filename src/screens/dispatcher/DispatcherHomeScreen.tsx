import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCard } from '../../components/AlertCard';
import { CaseRow } from '../../components/CaseRow';
import { MetricCard } from '../../components/MetricCard';
import { StatusPill } from '../../components/StatusPill';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockAlerts, mockCases, mockHospitals } from '../../constants/mockData';
import { Typography } from '../../constants/typography';
import type { DispatcherStackParamList } from '../../navigation/types';

type Nav = StackNavigationProp<DispatcherStackParamList>;

export function DispatcherHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const activeEmergencies = useMemo(
    () => mockCases.filter(c => c.status === 'enroute').length,
    [],
  );

  const bedsFreeCity = useMemo(
    () =>
      mockHospitals.reduce((acc, h) => acc + h.icuFree + h.generalFree, 0),
    [],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.danger} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{Labels.dispatcherHome}</Text>
            <Text style={styles.zone}>{Labels.zone}</Text>
          </View>
          <StatusPill label={`${activeEmergencies} active`} type="critical" />
        </View>

        <View style={styles.metrics}>
          <MetricCard label={Labels.activeEmergencies} value={activeEmergencies} colorType="danger" />
          <View style={{ width: 10 }} />
          <MetricCard label={Labels.bedsFreeCitywide} value={bedsFreeCity} colorType="success" />
        </View>

        <Text style={styles.section}>{Labels.liveAlerts}</Text>
        {mockAlerts.slice(0, 3).map(a => (
          <AlertCard key={a.id} type={a.type} message={a.message} time={a.time} />
        ))}

        <Text style={styles.section}>{Labels.activeCases}</Text>
        <View style={styles.caseList}>
          {mockCases.map(c => (
            <View key={c.id} style={{ marginBottom: 10 }}>
              <CaseRow
                item={c}
                onPress={() => navigation.navigate('CaseDetail', { caseId: c.id })}
              />
            </View>
          ))}
        </View>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => Alert.alert(Labels.newEmergencyTitle, Labels.featureComingSoon)}>
          <Text style={styles.primaryBtnText}>{Labels.newEmergencyButton}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { ...Typography.h1, color: Colors.textPrimary },
  zone: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  metrics: { flexDirection: 'row', marginBottom: 16 },
  section: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 8, marginTop: 8 },
  caseList: { marginBottom: 8 },
  primaryBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { ...Typography.h3, color: Colors.white },
});
