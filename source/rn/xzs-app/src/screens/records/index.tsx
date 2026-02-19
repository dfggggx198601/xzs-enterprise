import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { examPaperAnswerApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';

export default function RecordsScreen() {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async (page: number, refresh = false) => {
    if (loading && !refresh) return;
    setLoading(true);
    try {
      const res = await examPaperAnswerApi.pageList({ pageIndex: page, pageSize: 20 });
      if (res.code === 1) {
        const list = res.response?.list || [];
        setRecords(refresh ? list : [...records, ...list]);
        setTotal(res.response?.total || 0);
        setPageIndex(page);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [loading, records]);

  useEffect(() => {
    loadRecords(1, true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords(1, true);
    setRefreshing(false);
  };

  const scoreColor = (s: number) => s >= 80 ? colors.secondary : s >= 60 ? colors.warning : colors.error;

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ExamResult', { id: item.id, score: item.userScore })}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.paperName}</Text>
        <Text style={[styles.cardScore, { color: scoreColor(item.userScore) }]}>
          {item.userScore}<Text style={styles.cardScoreTotal}>/{item.systemScore}</Text>
        </Text>
      </View>
      <View style={styles.cardBottom}>
        {item.subjectName && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.subjectName}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="clock-outline" size={13} color={colors.textLight} />
          <Text style={styles.metaText}>{item.doTime}</Text>
        </View>
        <Text style={styles.metaText}>{item.createTime}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={() => records.length < total && loadRecords(pageIndex + 1)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>暂无考试记录</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginRight: spacing.sm },
  cardScore: { fontSize: fontSize.xl, fontWeight: '800' },
  cardScoreTotal: { fontSize: fontSize.sm, fontWeight: '400', color: colors.textLight },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '500' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: fontSize.xs, color: colors.textLight },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, marginTop: spacing.md },
});
