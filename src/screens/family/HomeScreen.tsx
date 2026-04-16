import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>{Labels.appName}</Text>
          <Text style={styles.subtitle}>Emergency Healthcare Coordination</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="hospital" size={32} color={Colors.danger} />
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Active Hospitals</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="ambulance" size={32} color={Colors.danger} />
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Available Ambulances</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Pressable style={styles.actionCard}>
            <Icon name="phone" size={24} color={Colors.danger} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Emergency Hotline</Text>
              <Text style={styles.actionSubtitle}>Call 108 for immediate assistance</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.actionCard}>
            <Icon name="map-marker" size={24} color={Colors.danger} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Find Nearby Hospitals</Text>
              <Text style={styles.actionSubtitle}>Locate closest medical facilities</Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textTertiary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Icon name="check-circle" size={20} color={Colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Ambulance Dispatched</Text>
              <Text style={styles.activityTime}>2 minutes ago</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Icon name="hospital" size={20} color={Colors.info} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Bed Available at City Hospital</Text>
              <Text style={styles.activityTime}>15 minutes ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 30 },
  appName: { ...Typography.h1, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: { ...Typography.h2, color: Colors.textPrimary, marginTop: 8 },
  statLabel: { ...Typography.small, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 30 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 15 },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionContent: { flex: 1, marginLeft: 16 },
  actionTitle: { ...Typography.body, color: Colors.textPrimary },
  actionSubtitle: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: { marginLeft: 12, flex: 1 },
  activityTitle: { ...Typography.body, color: Colors.textPrimary },
  activityTime: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
});
