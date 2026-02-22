import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { questionAnswerApi } from '../../api';
import { spacing } from '../../theme';
import { questionTypeLabel, stripHtml } from '../../utils';

const STREAK_KEY_PREFIX = 'wrong_streak_';

const typeBadgeColors: Record<number, { bg: string, text: string }> = {
  1: { bg: '#e0e7ff', text: '#4f46e5' }, // 判断
  2: { bg: '#dbeafe', text: '#2563eb' }, // 单选
  3: { bg: '#fef08a', text: '#a16207' }, // 多选
  4: { bg: '#fce7f3', text: '#be185d' }, // 填空
  5: { bg: '#e0f2fe', text: '#0369a1' }, // 简答
};

export default function WrongQuestionsScreen() {
  const navigation = useNavigation<any>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  const loadStreaks = useCallback(async (items: any[]) => {
    const result: Record<string, number> = {};
    for (const item of items) {
      const val = await AsyncStorage.getItem(`${STREAK_KEY_PREFIX}${item.id}`);
      result[item.id] = parseInt(val || '0', 10);
    }
    setStreaks(prev => ({ ...prev, ...result }));
  }, []);

  const loadQuestions = useCallback(async (page: number, refresh = false) => {
    if (loading && !refresh) return;
    setLoading(true);
    try {
      const params: any = { pageIndex: page, pageSize: 20 };
      const res = await questionAnswerApi.pageList(params);
      if (res.code === 1) {
        const list = res.response?.list || [];
        const newList = refresh ? list : [...questions, ...list];
        setQuestions(newList);
        setTotal(res.response?.total || 0);
        setPageIndex(page);
        await loadStreaks(list);
      }
    } catch { } finally {
      setLoading(false);
    }
  }, [loading, questions, loadStreaks]);

  useFocusEffect(
    useCallback(() => {
      loadQuestions(1, true);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuestions(1, true);
    setRefreshing(false);
  };

  const handleDelete = (item: any) => {
    Alert.alert('删除错题', '确定要删除这道题吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive', onPress: async () => {
          try {
            const res = await questionAnswerApi.delete(item.id);
            if (res.code === 1) {
              setQuestions(prev => prev.filter(q => q.id !== item.id));
              setTotal(prev => prev - 1);
              await AsyncStorage.removeItem(`${STREAK_KEY_PREFIX}${item.id}`);
            } else {
              Alert.alert('提示', res.message || '删除失败');
            }
          } catch {
            Alert.alert('提示', '删除失败');
          }
        }
      },
    ]);
  };

  const handleQuestionPress = (item: any) => {
    navigation.navigate('QuestionDetail', { id: item.id });
  };

  const getAnswerContent = (answer: string, items: any[]) => {
    if (!answer) return '无';
    if (!items || items.length === 0) return answer;
    const letters = answer.split(',').map(s => s.trim().toUpperCase());
    const result: string[] = [];
    for (const char of letters) {
      if (char.length !== 1) { result.push(char); continue; }
      const index = char.charCodeAt(0) - 65;
      if (index >= 0 && index < items.length && items[index] && items[index].content) {
        result.push(items[index].content);
      } else {
        result.push(char);
      }
    }
    return result.length > 0 ? result.join('\n') : answer;
  };

  const renderItem = ({ item }: { item: any }) => {
    const badgeColors = typeBadgeColors[item.questionType] || { bg: '#f1f5f9', text: '#475569' };
    const streak = streaks[item.id] || 0;
    const canDelete = streak >= 3;

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleQuestionPress(item)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.typeBadgeText, { color: badgeColors.text }]}>
              {questionTypeLabel(item.questionType)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#22c55e" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
            {canDelete && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.questionText} numberOfLines={0}>
          {item.fullTitle || stripHtml(item.title || '')}
        </Text>

        <View style={styles.answersContainer}>
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>你的答案:</Text>
            <Text style={[styles.answerValue, styles.answerWrong]}>
              {item.yourAnswer ? getAnswerContent(item.yourAnswer, item.questionItems) : '无'}
            </Text>
          </View>
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>正确答案:</Text>
            <Text style={[styles.answerValue, styles.answerRight]}>
              {item.correctAnswer ? getAnswerContent(item.correctAnswer, item.questionItems) : '无'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{item.createTime}</Text>
          {item.subjectName && (
            <Text style={styles.dateText}>{item.subjectName}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        onEndReached={() => questions.length < total && loadQuestions(pageIndex + 1)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>暂无错题</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { padding: 20 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: { fontSize: 12, color: '#22c55e', fontWeight: '600' },
  deleteBtn: { padding: 4 },
  questionText: { fontSize: 15, color: '#0f172a', lineHeight: 22, marginBottom: 16, fontWeight: '500' },

  answersContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  answerLabel: {
    width: 70,
    fontSize: 14,
    color: '#64748b',
  },
  answerValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  answerWrong: { color: '#ef4444' },
  answerRight: { color: '#22c55e' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11, color: '#94a3b8' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#94a3b8', marginTop: 16 },
});
