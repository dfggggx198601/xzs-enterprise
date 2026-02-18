import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { examPaperApi, subjectApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';

const accentColors = [colors.primary, colors.secondary, colors.warning, '#9B59B6', colors.error, '#3498DB'];

export default function ExamListScreen() {
  const navigation = useNavigation<any>();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadSubjects = useCallback(async () => {
    try {
      const res = await subjectApi.list();
      if (res.code === 1) setSubjects(res.response || []);
    } catch {}
  }, []);

  const loadPapers = useCallback(async (page: number, refresh = false) => {
    if (loading && !refresh) return;
    setLoading(true);
    try {
      const res = await examPaperApi.pageList({
        subjectId: selectedSubject,
        pageIndex: page,
        pageSize: 10,
      });
      if (res.code === 1) {
        const list = res.response?.list || [];
        setPapers(refresh ? list : [...papers, ...list]);
        setTotal(res.response?.total || 0);
        setPageIndex(page);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [selectedSubject, loading, papers]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    loadPapers(1, true);
  }, [selectedSubject]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPapers(1, true);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (papers.length < total) {
      loadPapers(pageIndex + 1);
    }
  };

  const filteredPapers = searchText
    ? papers.filter((p) => p.name?.includes(searchText))
    : papers;

  const renderSubjectChip = (subject: any, index: number) => {
    const isSelected = selectedSubject === subject.id;
    return (
      <TouchableOpacity
        key={subject.id}
        style={[styles.chip, isSelected && styles.chipActive]}
        onPress={() => setSelectedSubject(isSelected ? null : subject.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
          {subject.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPaper = ({ item, index }: { item: any; index: number }) => {
    const accent = accentColors[index % accentColors.length];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ExamTaking', { id: item.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.cardAccent, { backgroundColor: accent }]} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.questionCount}题</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.score}分</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.suggestTime}分钟</Text>
            </View>
          </View>
        </View>
        <View style={[styles.startBtn, { backgroundColor: accent + '15' }]}>
          <MaterialCommunityIcons name="play-circle-outline" size={28} color={accent} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索试卷..."
          placeholderTextColor={colors.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.chipRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={subjects}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => renderSubjectChip(item, index)}
          ListHeaderComponent={
            <TouchableOpacity
              style={[styles.chip, selectedSubject === null && styles.chipActive]}
              onPress={() => setSelectedSubject(null)}
            >
              <Text style={[styles.chipText, selectedSubject === null && styles.chipTextActive]}>全部</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={styles.chipList}
        />
      </View>

      <FlatList
        data={filteredPapers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPaper}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="file-document-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>暂无试卷</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  chipRow: {
    marginTop: spacing.md,
  },
  chipList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  startBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
