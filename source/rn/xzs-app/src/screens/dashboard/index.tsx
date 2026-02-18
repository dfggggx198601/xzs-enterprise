import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, userApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';

interface DashboardData {
  fixedPaper: any[];
  timeLimitPaper: any[];
  classPaper: any[];
}

interface TaskItem {
  id: number;
  title: string;
  createTime: string;
}

const quickActions = [
  { key: 'ExamList', icon: 'file-document-outline' as const, label: '试卷中心', color: colors.primary },
  { key: 'DailyPractice', icon: 'lightning-bolt' as const, label: '每日一练', color: '#E67E22' },
  { key: 'Records', icon: 'history' as const, label: '考试记录', color: colors.secondary },
  { key: 'WrongQuestions', icon: 'book-alert-outline' as const, label: '错题本', color: colors.warning },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    try {
      const [dashRes, taskRes, msgRes] = await Promise.all([
        dashboardApi.index(),
        dashboardApi.task(),
        userApi.getMessageCount(),
      ]);
      if (dashRes.code === 1) setDashData(dashRes.response);
      if (taskRes.code === 1) setTasks(taskRes.response || []);
      if (msgRes.code === 1) setUnreadCount(msgRes.response || 0);
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const paperCount =
    (dashData?.fixedPaper?.length || 0) +
    (dashData?.timeLimitPaper?.length || 0) +
    (dashData?.classPaper?.length || 0);

  const stats = [
    { icon: 'file-document-check-outline' as const, value: paperCount, label: '可用试卷', color: colors.primary, target: 'ExamList' },
    { icon: 'clock-check-outline' as const, value: tasks.length, label: '待办任务', color: colors.warning, target: 'ExamList' },
    { icon: 'email-outline' as const, value: unreadCount, label: '未读消息', color: colors.secondary, target: 'Messages' },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>你好，{user?.realName || '员工'}</Text>
              <Text style={styles.subGreeting}>欢迎使用企业考试系统</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => navigation.navigate('Messages')}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.realName || '员')[0]}
                </Text>
              </View>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <TouchableOpacity key={i} style={styles.statCard} onPress={() => navigation.navigate(s.target)} activeOpacity={0.7}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '15' }]}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速入口</Text>
          <View style={styles.quickGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.key}
                style={styles.quickItem}
                onPress={() => navigation.navigate(a.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickIcon, { backgroundColor: a.color + '15' }]}>
                  <MaterialCommunityIcons name={a.icon} size={26} color={a.color} />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>待办任务</Text>
          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="check-circle-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>暂无待办任务</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => navigation.navigate('ExamTaking', { id: task.id })}
                activeOpacity={0.7}
              >
                <View style={styles.taskLeft}>
                  <View style={styles.taskDot} />
                  <View>
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.taskTime}>{task.createTime}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl + 40,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: -36,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    alignItems: 'center',
    width: '23%',
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
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
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  taskTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  taskTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
});
