import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { dailyPracticeApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';

interface PracticeItem {
  id: number;
  title: string;
  questionCount: number;
  completed: boolean;
  score?: number;
}

interface HistoryItem {
  id: number;
  dailyPracticeId: number;
  title: string;
  score: number;
  questionCount: number;
  createTime: string;
}

export default function DailyPracticeScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [todayList, setTodayList] = useState<PracticeItem[]>([]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadToday = useCallback(async () => {
    try {
      const res = await dailyPracticeApi.list();
      if (res.code === 1) setTodayList(res.response || []);
    } catch {} finally {
      setTodayLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (page = 1, append = false) => {
    try {
      setHistoryLoading(true);
      const res = await dailyPracticeApi.history({ pageIndex: page, pageSize: 10 });
      if (res.code === 1) {
        const items = res.response?.list || [];
        setHistoryList(prev => append ? [...prev, ...items] : items);
        setHasMore(items.length >= 10);
        setHistoryPage(page);
      }
    } catch {} finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
    loadHistory(1);
  }, [loadToday, loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadToday(), loadHistory(1)]);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!historyLoading && hasMore) {
      loadHistory(historyPage + 1, true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>每日一练</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日练习</Text>
          {todayLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : todayList.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="calendar-check-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>今日暂无练习</Text>
            </View>
          ) : (
            todayList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.practiceCard}
                onPress={() => !item.completed && navigation.navigate('DailyPracticeTaking', { id: item.id })}
                activeOpacity={item.completed ? 1 : 0.7}
              >
                <View style={[styles.cardIcon, { backgroundColor: item.completed ? colors.secondary + '15' : colors.primary + '15' }]}>
                  <MaterialCommunityIcons
                    name={item.completed ? 'check-circle-outline' : 'lightning-bolt'}
                    size={24}
                    color={item.completed ? colors.secondary : colors.primary}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.questionCount}题</Text>
                </View>
                {item.completed ? (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{item.score}分</Text>
                  </View>
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textLight} />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>练习记录</Text>
          {historyList.length === 0 && !historyLoading ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="history" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>暂无练习记录</Text>
            </View>
          ) : (
            <>
              {historyList.map((item, idx) => (
                <View key={`${item.id}-${idx}`} style={styles.historyCard}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.historyTime}>{item.createTime}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyScore}>{item.score}</Text>
                    <Text style={styles.historyScoreLabel}>分</Text>
                  </View>
                </View>
              ))}
              {hasMore && (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore} disabled={historyLoading}>
                  {historyLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>加载更多</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  topTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  practiceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  cardSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  scoreText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.secondary,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  historyLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  historyTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  historyTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  historyScore: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  historyScoreLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
});
