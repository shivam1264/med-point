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
import { StatusPill } from '../../components/StatusPill';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockFamilyPatient } from '../../constants/mockData';
import { Typography } from '../../constants/typography';

export function FamilyTrackingScreen() {
  const [loading, setLoading] = useState(true);
  const patient = mockFamilyPatient;

  const timeline = useMemo(() => patient.timeline, [patient]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.danger} />
        </View>
      </SafeAreaView>
    );
  }

  const firstPendingIdx = timeline.findIndex(t => !t.done);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>{Labels.trackPatient}</Text>
          <StatusPill label={Labels.safeStatus} type="success" />
        </View>

        <View style={styles.featured}>
          <Text style={styles.pName}>{patient.name}</Text>
          <Text style={styles.pMeta}>
            {patient.caseId} · {patient.status}
          </Text>
          <Text style={styles.pMeta}>{patient.hospital}</Text>
          <Text style={styles.pMeta}>{patient.ward}</Text>
          <Text style={styles.pDoctor}>{patient.doctor}</Text>
        </View>

        <Text style={styles.section}>{Labels.timeline}</Text>
        <View style={styles.timeline}>
          {timeline.map((step, i) => {
            const isDone = step.done;
            const isCurrent = !isDone && i === firstPendingIdx;
            const dotColor = isDone
              ? Colors.success
              : isCurrent
                ? Colors.info
                : Colors.gray;
            const isLast = i === timeline.length - 1;
            return (
              <View key={step.label} style={styles.tlRow}>
                <View style={styles.tlCol}>
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                  {!isLast && <View style={styles.line} />}
                </View>
                <View style={styles.tlContent}>
                  <Text style={styles.tlLabel}>{step.label}</Text>
                  <Text style={styles.tlSub}>{step.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          style={styles.outlineBtn}
          onPress={() =>
            Alert.alert(Labels.contactHelpdesk, Labels.helpdeskPhone)
          }>
          <Text style={styles.outlineText}>{Labels.contactHelpdesk}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { ...Typography.h1, color: Colors.textPrimary },
  featured: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
    padding: 14,
    marginBottom: 16,
  },
  pName: { ...Typography.h2, color: Colors.textPrimary },
  pMeta: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  pDoctor: { ...Typography.body, color: Colors.successDark, marginTop: 8 },
  section: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 10 },
  timeline: { marginBottom: 16 },
  tlRow: { flexDirection: 'row', minHeight: 56 },
  tlCol: { width: 24, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 2,
    marginBottom: -2,
  },
  tlContent: { flex: 1, paddingLeft: 8, paddingBottom: 12 },
  tlLabel: { ...Typography.body, color: Colors.textPrimary },
  tlSub: { ...Typography.small, color: Colors.textTertiary, marginTop: 2 },
  outlineBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineText: { ...Typography.h3, color: Colors.danger },
});
