import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, userApi } from '../../api';
import { spacing } from '../../theme';

interface DashboardData {
  fixedPaper: any[];
  timeLimitPaper: any[];
  classPaper: any[];
}

const quickActions = [
  { key: 'ExamList', icon: 'file-document-outline' as const, label: '试卷中心', color: '#4f46e5', bg: '#e0e7ff' },
  { key: 'DailyPractice', icon: 'lightning-bolt' as const, label: '每日一练', color: '#ea580c', bg: '#ffedd5' },
  { key: 'Records', icon: 'history' as const, label: '考试记录', color: '#0d9488', bg: '#ccfbf1' },
  { key: 'WrongQuestions', icon: 'book-alert-outline' as const, label: '错题本', color: '#e11d48', bg: '#ffe4e6' },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    try {
      const [dashRes, msgRes] = await Promise.all([
        dashboardApi.index(),
        userApi.getMessageCount(),
      ]);
      if (dashRes.code === 1) setDashData(dashRes.response);
      if (msgRes.code === 1) setUnreadCount(msgRes.response || 0);
    } catch { }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

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
    { icon: 'file-document-edit-outline' as const, value: paperCount, label: '可用试卷', color: '#2563eb', bg: '#dbeafe', target: 'ExamList' },
    { icon: 'bell-outline' as const, value: unreadCount, label: '未读消息', color: '#16a34a', bg: '#dcfce7', target: 'Messages' },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>你好，{user?.realName || '员工'} 👋</Text>
              <Text style={styles.subGreeting}>记录学习点滴，铸就专业实力</Text>
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
              <View style={[styles.statIconWrap, { backgroundColor: s.bg }]}>
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
                <View style={[styles.quickIcon, { backgroundColor: a.bg }]}>
                  <MaterialCommunityIcons name={a.icon} size={26} color={a.color} />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最新动态</Text>

          <TouchableOpacity style={styles.banner} activeOpacity={0.8} onPress={() => navigation.navigate('Todo')}>
            <LinearGradient colors={['#ffffff', '#f0fdf4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bannerGradient, { borderLeftColor: '#22c55e' }]}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>每日待办</Text>
                <Text style={styles.bannerSubtitle}>合理规划，高效学习</Text>
              </View>
              <View style={styles.fireIconWrap}>
                <MaterialCommunityIcons name="calendar-check" size={32} color="#22c55e" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.banner, { marginTop: 16 }]} activeOpacity={0.8} onPress={() => navigation.navigate('WrongQuestions')}>
            <LinearGradient colors={['#ffffff', '#fff1f2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bannerGradient, { borderLeftColor: '#ef4444' }]}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>错题消灭计划</Text>
                <Text style={styles.bannerSubtitle}>回顾错题，保持连对记录！</Text>
              </View>
              <View style={styles.fireIconWrap}>
                <MaterialCommunityIcons name="fire" size={32} color="#ef4444" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingBottom: spacing.xl + 50,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: -40,
    gap: 16,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 20,
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
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickLabel: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  banner: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 20,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  bannerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  fireIconWrap: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
// OTA force update 2
