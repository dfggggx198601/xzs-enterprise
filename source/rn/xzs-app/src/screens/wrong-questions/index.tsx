import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { questionAnswerApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';
import { questionTypeLabel, stripHtml } from '../../utils';

const typeFilters = [
  { label: '全部', value: null },
  { label: '单选题', value: 1 },
  { label: '多选题', value: 2 },
  { label: '判断题', value: 3 },
  { label: '填空题', value: 4 },
  { label: '简答题', value: 5 },
];

const typeBadgeColors: Record<number, string> = {
  1: colors.primary,
  2: colors.secondary,
  3: colors.warning,
  4: '#9B59B6',
  5: '#3498DB',
};

export default function WrongQuestionsScreen() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<number | null>(null);

  const loadQuestions = useCallback(async (page: number, refresh = false) => {
    if (loading && !refresh) return;
    setLoading(true);
    try {
      const params: any = { pageIndex: page, pageSize: 20 };
      if (typeFilter !== null) params.questionType = typeFilter;
      const res = await questionAnswerApi.pageList(params);
      if (res.code === 1) {
        const list = res.response?.list || [];
        setQuestions(refresh ? list : [...questions, ...list]);
        setTotal(res.response?.total || 0);
        setPageIndex(page);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [loading, questions, typeFilter]);

  useEffect(() => {
    loadQuestions(1, true);
  }, [typeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuestions(1, true);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const badgeColor = typeBadgeColors[item.questionType] || colors.primary;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor + '15' }]}>
            <Text style={[styles.typeBadgeText, { color: badgeColor }]}>
              {questionTypeLabel(item.questionType)}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.createTime}</Text>
        </View>
        <Text style={styles.questionText} numberOfLines={2}>{stripHtml(item.title || '')}</Text>
        {item.subjectName && (
          <View style={styles.cardFooter}>
            <View style={styles.subjectTag}>
              <Text style={styles.subjectTagText}>{item.subjectName}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {typeFilters.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filterChip, typeFilter === f.value && styles.filterChipActive]}
            onPress={() => setTypeFilter(f.value)}
          >
            <Text style={[styles.filterText, typeFilter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={questions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={() => questions.length < total && loadQuestions(pageIndex + 1)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>暂无错题</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { maxHeight: 52, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  dateText: { fontSize: fontSize.xs, color: colors.textLight },
  questionText: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  cardFooter: { flexDirection: 'row', marginTop: spacing.sm },
  subjectTag: { backgroundColor: colors.primary + '10', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  subjectTagText: { fontSize: fontSize.xs, color: colors.primary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, marginTop: spacing.md },
});
