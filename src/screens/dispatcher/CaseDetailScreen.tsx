import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
import { StatusPill } from '../../components/StatusPill';
import { VitalsGrid } from '../../components/VitalsGrid';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockCases, mockHospitals } from '../../constants/mockData';
import { Typography } from '../../constants/typography';
import type { DispatcherStackParamList } from '../../navigation/types';
import type { CaseSeverity } from '../../types';

type Props = {
  navigation: StackNavigationProp<DispatcherStackParamList, 'CaseDetail'>;
  route: RouteProp<DispatcherStackParamList, 'CaseDetail'>;
};

function CaseDetailHeaderRight({ severity }: { severity: CaseSeverity }) {
  return (
    <View style={styles.headerRight}>
      <StatusPill label={severity} type={severity} />
    </View>
  );
}

export function CaseDetailScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const item = useMemo(() => mockCases.find(c => c.id === caseId), [caseId]);

  useLayoutEffect(() => {
    if (item) {
      const sev = item.severity;
      navigation.setOptions({
        headerRight: () => <CaseDetailHeaderRight severity={sev} />,
      });
    }
  }, [navigation, item]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.danger} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <Text style={styles.empty}>{Labels.noData}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const etaMinutes = parseInt(item.eta, 10);
  const etaUrgent = !Number.isNaN(etaMinutes) && etaMinutes < 10;

  const onReroute = () => {
    const list = mockHospitals.map(h => `• ${h.name}`).join('\n');
    Alert.alert(Labels.rerouteTitle, `${Labels.selectHospital}\n\n${list}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.caseId}>{item.id}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Labels.patientInfo}</Text>
          <Text style={styles.body}>{item.type}</Text>
          <Text style={styles.meta}>
            {item.patientAge} / {item.patientGender} · {item.ambulanceId}
          </Text>
          <Text style={styles.meta}>{item.location}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Labels.vitalsLive}</Text>
          <VitalsGrid vitals={item.vitals} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Labels.routing}</Text>
          <Text style={styles.hospital}>{item.assignedHospital}</Text>
          <Text style={[styles.eta, etaUrgent && { color: Colors.danger }]}>
            {Labels.eta}: {item.eta}
          </Text>
          <Text style={styles.specialist}>{Labels.specialistReadyLabel}</Text>
        </View>

        <Pressable style={styles.rerouteBtn} onPress={onReroute}>
          <Text style={styles.rerouteText}>{Labels.rerouteHospital}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRight: { paddingRight: 16 },
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { ...Typography.body, color: Colors.textTertiary },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  caseId: { ...Typography.h1, color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 8 },
  body: { ...Typography.body, color: Colors.textSecondary },
  meta: { ...Typography.small, color: Colors.textTertiary, marginTop: 4 },
  hospital: { ...Typography.h3, color: Colors.info },
  eta: { ...Typography.body, color: Colors.textPrimary, marginTop: 6 },
  specialist: { ...Typography.body, color: Colors.success, marginTop: 6 },
  rerouteBtn: {
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.info,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rerouteText: { ...Typography.h3, color: Colors.infoDark },
});
