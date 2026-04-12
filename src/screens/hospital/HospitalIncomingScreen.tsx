import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaseRow } from '../../components/CaseRow';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { mockCases } from '../../constants/mockData';
import { Typography } from '../../constants/typography';
import type { CaseItem } from '../../types';

function Separator() {
  return <View style={styles.sep} />;
}

export function HospitalIncomingScreen() {
  const [loading, setLoading] = useState(true);

  const data = useMemo(
    () => mockCases.filter(c => c.assignedHospital === Labels.defaultHospitalName),
    [],
  );

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{Labels.incoming}</Text>
      <FlatList
        data={data}
        keyExtractor={c => c.id}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{Labels.noData}</Text>}
        renderItem={({ item }: { item: CaseItem }) => (
          <CaseRow
            item={item}
            onPress={() => Alert.alert(item.id, item.type)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h1, color: Colors.textPrimary, paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  sep: { height: 10 },
  empty: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center' },
});
