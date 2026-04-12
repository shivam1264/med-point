import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import type { DispatcherStackParamList } from '../../navigation/types';

type Nav = StackNavigationProp<DispatcherStackParamList>;

function Separator() {
  return <View style={styles.sep} />;
}

export function CaseListScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);

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
      <Text style={styles.title}>{Labels.cases}</Text>
      <FlatList
        data={mockCases}
        keyExtractor={c => c.id}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={mockCases.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{Labels.noData}</Text>}
        renderItem={({ item }: { item: CaseItem }) => (
          <CaseRow
            item={item}
            onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
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
