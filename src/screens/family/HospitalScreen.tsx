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

export function HospitalScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Hospitals</Text>
          <Text style={styles.subtitle}>Find and connect with medical facilities</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={Colors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search hospitals...</Text>
          </View>
          <Pressable style={styles.filterBtn}>
            <Icon name="filter" size={20} color={Colors.danger} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Hospitals</Text>
          
          <View style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <View style={styles.hospitalIcon}>
                <Icon name="hospital" size={28} color={Colors.white} />
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>City General Hospital</Text>
                <Text style={styles.hospitalAddress}>123 Main Street, Downtown</Text>
                <View style={styles.hospitalMeta}>
                  <View style={styles.rating}>
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                  <Text style={styles.distance}>2.3 km</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.hospitalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>ICU Beds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>General Beds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>OTs</Text>
              </View>
            </View>

            <View style={styles.hospitalActions}>
              <Pressable style={styles.actionBtn}>
                <Icon name="phone" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Call</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Icon name="navigation" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Navigate</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Icon name="information" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Details</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <View style={styles.hospitalIconWarning}>
                <Icon name="hospital" size={28} color={Colors.white} />
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>MediCare Center</Text>
                <Text style={styles.hospitalAddress}>456 Park Avenue, West Side</Text>
                <View style={styles.hospitalMeta}>
                  <View style={styles.rating}>
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Text style={styles.ratingText}>4.5</Text>
                  </View>
                  <Text style={styles.distance}>4.1 km</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.hospitalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>ICU Beds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>General Beds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>OTs</Text>
              </View>
            </View>

            <View style={styles.hospitalActions}>
              <Pressable style={styles.actionBtn}>
                <Icon name="phone" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Call</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Icon name="navigation" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Navigate</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Icon name="information" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Details</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <View style={styles.hospitalIconSuccess}>
                <Icon name="hospital" size={28} color={Colors.white} />
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>Emergency Medical Center</Text>
                <Text style={styles.hospitalAddress}>789 Highway Road, North District</Text>
                <View style={styles.hospitalMeta}>
                  <View style={styles.rating}>
                    <Icon name="star" size={14} color={Colors.warning} />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                  <Text style={styles.distance}>6.7 km</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.hospitalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>18</Text>
                <Text style={styles.statLabel}>ICU Beds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>32</Text>
                <Text style={styles.statLabel}>General Beds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>OTs</Text>
              </View>
            </View>

            <View style={styles.hospitalActions}>
              <Pressable style={styles.actionBtn}>
                <Icon name="phone" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Call</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Icon name="navigation" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Navigate</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Icon name="information" size={16} color={Colors.danger} />
                <Text style={styles.actionBtnText}>Details</Text>
              </Pressable>
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
  header: { paddingTop: 20, paddingBottom: 20 },
  title: { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPlaceholder: { ...Typography.body, color: Colors.textTertiary, marginLeft: 8 },
  filterBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: 30 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 15 },
  hospitalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  hospitalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalIconWarning: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalIconSuccess: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalInfo: { flex: 1, marginLeft: 12 },
  hospitalName: { ...Typography.body, color: Colors.textPrimary },
  hospitalAddress: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: { ...Typography.small, color: Colors.textSecondary, marginLeft: 4 },
  distance: { ...Typography.small, color: Colors.textSecondary },
  hospitalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: { alignItems: 'center' },
  statNumber: { ...Typography.h3, color: Colors.textPrimary },
  statLabel: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  hospitalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  actionBtnText: { ...Typography.small, color: Colors.danger, marginLeft: 4 },
});
