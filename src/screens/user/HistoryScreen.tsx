import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, 
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface HistoryItem {
  id: string;
  type: 'Emergency SOS' | 'Hospital Visit' | 'Doctor Consult';
  date: string;
  location: string;
  status: 'Completed' | 'Cancelled' | 'In Progress';
  icon: string;
  color: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    type: 'Emergency SOS',
    date: 'Oct 24, 2023 • 10:30 AM',
    location: 'City Hospital, Bhopal',
    status: 'Completed',
    icon: 'alert-decagram',
    color: Colors.danger,
  },
  {
    id: '2',
    type: 'Doctor Consult',
    date: 'Oct 20, 2023 • 02:15 PM',
    location: 'Dr. Sharma Specialty Clinic',
    status: 'Completed',
    icon: 'doctor',
    color: Colors.success,
  },
  {
    id: '3',
    type: 'Emergency SOS',
    date: 'Oct 15, 2023 • 11:45 PM',
    location: 'Bhopal Memorial Hospital',
    status: 'Cancelled',
    icon: 'alert-decagram',
    color: Colors.gray,
  },
  {
    id: '4',
    type: 'Hospital Visit',
    date: 'Sep 28, 2023 • 09:00 AM',
    location: 'Global Heart Center',
    status: 'Completed',
    icon: 'hospital-building',
    color: Colors.info,
  },
];

export function HistoryScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.date}>{item.date}</Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
      <View style={styles.statusBox}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'Completed' ? Colors.success : item.status === 'Cancelled' ? Colors.danger : Colors.warning }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Medical History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="filter-variant" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={MOCK_HISTORY}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListHeaderComponent={
            <View style={styles.summaryBox}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>12</Text>
                <Text style={styles.summaryLabel}>Total Logs</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>2</Text>
                <Text style={styles.summaryLabel}>Emergencies</Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.grayLight
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  filterBtn: { padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  summaryBox: {
    flexDirection: 'row', backgroundColor: Colors.grayLight,
    padding: 20, borderRadius: 24, marginBottom: 24, alignItems: 'center'
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: Colors.border },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 16, borderRadius: 20, marginBottom: 16,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 16 },
  type: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  date: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  location: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  statusBox: { alignItems: 'flex-end' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  statusText: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, textTransform: 'uppercase' }
});
