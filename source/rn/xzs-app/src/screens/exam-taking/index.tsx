import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { examPaperApi, examPaperAnswerApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';
import { formatSeconds, questionTypeLabel, stripHtml } from '../../utils';

interface QuestionItem {
  id: number;
  questionType: number;
  title: string;
  items: { prefix: string; content: string }[];
  itemOrder: number;
}

interface AnswerItem {
  questionId: number;
  content: string;
  contentArray: string[];
  completed: boolean;
  itemOrder: number;
}

export default function ExamTakingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const paperId = route.params?.id;

  const [paper, setPaper] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, AnswerItem>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPaper();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadPaper = async () => {
    try {
      const res = await examPaperApi.select(paperId);
      if (res.code === 1 && res.response) {
        const p = res.response;
        setPaper(p);
        const allQuestions: QuestionItem[] = [];
        p.titleItems?.forEach((section: any) => {
          section.questionItems?.forEach((q: QuestionItem) => {
            allQuestions.push(q);
          });
        });
        setQuestions(allQuestions);
        setTimeLeft((p.suggestTime || 60) * 60);
        startTime.current = Date.now();
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              handleSubmit(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {}
  };

  const updateAnswer = (questionId: number, content: string, contentArray: string[], itemOrder: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        content,
        contentArray,
        completed: content.length > 0 || contentArray.some((c) => c.length > 0),
        itemOrder,
      },
    }));
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    const doSubmit = async () => {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const doTime = Math.floor((Date.now() - startTime.current) / 1000);
      const answerItems = questions.map((q) => {
        const a = answers[q.id];
        return {
          questionId: q.id,
          content: a?.content || '',
          contentArray: a?.contentArray || [],
          completed: a?.completed || false,
          itemOrder: q.itemOrder,
        };
      });
      try {
        const res = await examPaperAnswerApi.answerSubmit({
          id: paperId,
          doTime,
          answerItems,
        });
        if (res.code === 1) {
          navigation.replace('ExamResult', {
            id: res.response?.id,
            score: parseFloat(res.response?.score || '0'),
          });
        } else {
          Alert.alert('提交失败', res.message || '试卷不能重复做');
        }
      } catch (error: any) {
        Alert.alert('提交失败', error?.message || '网络错误，请重试');
      } finally {
        setSubmitting(false);
      }
    };

    if (auto) {
      doSubmit();
    } else {
      const unanswered = questions.filter((q) => !answers[q.id]?.completed).length;
      Alert.alert(
        '提交试卷',
        unanswered > 0 ? `还有${unanswered}题未作答，确定提交吗？` : '确定提交试卷吗？',
        [
          { text: '取消', style: 'cancel' },
          { text: '确定', onPress: doSubmit },
        ]
      );
    }
  }, [submitting, questions, answers, paperId, navigation]);

  const switchQuestion = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrentIndex(index);
  };

  const currentQ = questions[currentIndex];
  const currentA = currentQ ? answers[currentQ.id] : undefined;

  const renderOptions = () => {
    if (!currentQ) return null;
    const { questionType, items, id, itemOrder } = currentQ;

    if (questionType === 1 || questionType === 3) {
      return (
        <View style={styles.optionsWrap}>
          {items.map((opt) => {
            const selected = currentA?.content === opt.prefix;
            return (
              <TouchableOpacity
                key={opt.prefix}
                style={[styles.optionCard, selected && styles.optionSelected]}
                onPress={() => updateAnswer(id, opt.prefix, [], itemOrder)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionPrefix, selected && styles.optionPrefixSelected]}>
                  <Text style={[styles.optionPrefixText, selected && styles.optionPrefixTextSelected]}>
                    {opt.prefix}
                  </Text>
                </View>
                <Text style={[styles.optionContent, selected && styles.optionContentSelected]}>
                  {stripHtml(opt.content)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (questionType === 2) {
      const selectedArr = currentA?.contentArray || [];
      return (
        <View style={styles.optionsWrap}>
          {items.map((opt) => {
            const selected = selectedArr.includes(opt.prefix);
            return (
              <TouchableOpacity
                key={opt.prefix}
                style={[styles.optionCard, selected && styles.optionSelected]}
                onPress={() => {
                  const newArr = selected
                    ? selectedArr.filter((p) => p !== opt.prefix)
                    : [...selectedArr, opt.prefix].sort();
                  updateAnswer(id, newArr.join(','), newArr, itemOrder);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
                  {selected && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.optionContent, selected && styles.optionContentSelected]}>
                  {opt.prefix}. {stripHtml(opt.content)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (questionType === 4) {
      return (
        <View style={styles.optionsWrap}>
          {items.map((opt, idx) => (
            <View key={idx} style={styles.fillWrap}>
              <Text style={styles.fillLabel}>空{idx + 1}</Text>
              <TextInput
                style={styles.fillInput}
                placeholder="请输入答案"
                placeholderTextColor={colors.textLight}
                value={(currentA?.contentArray || [])[idx] || ''}
                onChangeText={(text) => {
                  const arr = [...(currentA?.contentArray || [])];
                  arr[idx] = text;
                  updateAnswer(id, arr.join(','), arr, itemOrder);
                }}
              />
            </View>
          ))}
        </View>
      );
    }

    if (questionType === 5) {
      return (
        <TextInput
          style={styles.essayInput}
          placeholder="请输入答案"
          placeholderTextColor={colors.textLight}
          multiline
          textAlignVertical="top"
          value={currentA?.content || ''}
          onChangeText={(text) => updateAnswer(id, text, [], itemOrder)}
        />
      );
    }

    return null;
  };

  if (!paper || questions.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.paperName} numberOfLines={1}>{paper.name}</Text>
        <View style={[styles.timerWrap, timeLeft < 60 && styles.timerDanger]}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={timeLeft < 60 ? colors.error : colors.primary} />
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextDanger]}>
            {formatSeconds(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.numRow} contentContainerStyle={styles.numRowContent}>
        {questions.map((q, i) => {
          const answered = !!answers[q.id]?.completed;
          const isCurrent = i === currentIndex;
          return (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.numCircle,
                answered && styles.numAnswered,
                isCurrent && styles.numCurrent,
              ]}
              onPress={() => switchQuestion(i)}
            >
              <Text style={[
                styles.numText,
                answered && styles.numTextAnswered,
                isCurrent && styles.numTextCurrent,
              ]}>
                {i + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Animated.ScrollView style={[styles.questionArea, { opacity: fadeAnim }]} contentContainerStyle={styles.questionContent}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNum}>{currentIndex + 1}.</Text>
          <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={styles.typeBadgeText}>{questionTypeLabel(currentQ.questionType)}</Text>
          </View>
        </View>
        <Text style={styles.questionTitle}>{stripHtml(currentQ.title)}</Text>
        {renderOptions()}
      </Animated.ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => currentIndex > 0 && switchQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <MaterialCommunityIcons name="chevron-left" size={20} color={currentIndex === 0 ? colors.textLight : colors.primary} />
          <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>上一题</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)} disabled={submitting}>
          <Text style={styles.submitBtnText}>{submitting ? '提交中...' : '提交试卷'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, currentIndex === questions.length - 1 && styles.navBtnDisabled]}
          onPress={() => currentIndex < questions.length - 1 && switchQuestion(currentIndex + 1)}
          disabled={currentIndex === questions.length - 1}
        >
          <Text style={[styles.navBtnText, currentIndex === questions.length - 1 && styles.navBtnTextDisabled]}>下一题</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={currentIndex === questions.length - 1 ? colors.textLight : colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  paperName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  timerDanger: {
    backgroundColor: colors.error + '10',
  },
  timerText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  timerTextDanger: {
    color: colors.error,
  },
  numRow: {
    maxHeight: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  numRowContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  numCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  numAnswered: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  numCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  numText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  numTextAnswered: {
    color: '#FFFFFF',
  },
  numTextCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  questionArea: {
    flex: 1,
  },
  questionContent: {
    padding: spacing.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  questionNum: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  questionTitle: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  optionsWrap: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionPrefix: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionPrefixSelected: {
    backgroundColor: colors.primary,
  },
  optionPrefixText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionPrefixTextSelected: {
    color: '#FFFFFF',
  },
  optionContent: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  optionContentSelected: {
    color: colors.primary,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkBoxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  fillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fillLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    width: 36,
  },
  fillInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  essayInput: {
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  navBtnTextDisabled: {
    color: colors.textLight,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
