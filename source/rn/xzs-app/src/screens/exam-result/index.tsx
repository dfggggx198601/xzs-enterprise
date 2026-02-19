import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { examPaperAnswerApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';
import { questionTypeLabel, stripHtml } from '../../utils';

export default function ExamResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, score: passedScore } = route.params || {};
  const [result, setResult] = useState<any>(null);
  const [score, setScore] = useState<number>(passedScore || 0);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      const res = await examPaperAnswerApi.read(id);
      if (res.code === 1 && res.response) {
        setResult(res.response);
        const answer = res.response.answer;
        if (answer && answer.score !== undefined) {
          setScore(parseFloat(answer.score));
        }
      }
    } catch {}
  };

  const scoreColor = score >= 80 ? colors.secondary : score >= 60 ? colors.warning : colors.error;

  const totalQuestions = result?.answer?.answerItems?.length || 0;
  const correctCount = result?.answer?.answerItems?.filter((a: any) => a.doRight).length || 0;
  const wrongCount = totalQuestions - correctCount;

  const allQuestions: any[] = [];
  result?.paper?.titleItems?.forEach((section: any) => {
    section.questionItems?.forEach((q: any) => {
      allQuestions.push(q);
    });
  });

  const getAnswerForQuestion = (questionId: number) => {
    return result?.answer?.answerItems?.find((a: any) => a.questionId === questionId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>考试结果</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
            <Text style={[styles.scoreSuffix, { color: scoreColor }]}>分</Text>
          </View>
          <Text style={styles.paperName}>{result?.paper?.name || '考试'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.secondary }]}>{correctCount}</Text>
              <Text style={styles.statLabel}>答对</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.error }]}>{wrongCount}</Text>
              <Text style={styles.statLabel}>答错</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>总题数</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>答题详情</Text>

        {allQuestions.map((q, idx) => {
          const answer = getAnswerForQuestion(q.id);
          const isRight = answer?.doRight;
          return (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionLeft}>
                  <Text style={styles.questionIdx}>{idx + 1}.</Text>
                  <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={styles.typeBadgeText}>{questionTypeLabel(q.questionType)}</Text>
                  </View>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: isRight ? colors.secondary + '15' : colors.error + '15' }]}>
                  <MaterialCommunityIcons
                    name={isRight ? 'check-circle' : 'close-circle'}
                    size={16}
                    color={isRight ? colors.secondary : colors.error}
                  />
                  <Text style={{ color: isRight ? colors.secondary : colors.error, fontSize: fontSize.xs, fontWeight: '600' }}>
                    {isRight ? '正确' : '错误'}
                  </Text>
                </View>
              </View>
              <Text style={styles.questionTitle}>{stripHtml(q.title)}</Text>

              {q.items?.map((opt: any) => {
                const userSelected =
                  answer?.content === opt.prefix ||
                  answer?.contentArray?.includes(opt.prefix);
                const isCorrectOpt = q.correct === opt.prefix || q.correctArray?.includes(opt.prefix);
                return (
                  <View
                    key={opt.prefix}
                    style={[
                      styles.optionRow,
                      userSelected && !isRight && styles.optionWrong,
                      userSelected && isRight && styles.optionCorrect,
                    ]}
                  >
                    <Text style={styles.optionText}>
                      {opt.prefix}. {stripHtml(opt.content)}
                    </Text>
                    {userSelected && (
                      <MaterialCommunityIcons
                        name={isRight ? 'check' : 'close'}
                        size={16}
                        color={isRight ? colors.secondary : colors.error}
                      />
                    )}
                  </View>
                );
              })}

              {(q.questionType === 4 || q.questionType === 5) && answer && (
                <View style={[styles.answerBox, { borderColor: isRight ? colors.secondary : colors.error }]}>
                  <Text style={styles.answerLabel}>你的答案：</Text>
                  <Text style={styles.answerText}>
                    {answer.contentArray?.length > 0 ? answer.contentArray.join('、') : answer.content || '未作答'}
                  </Text>
                </View>
              )}

              {q.analyze && (
                <View style={styles.analyzeBox}>
                  <Text style={styles.analyzeLabel}>解析：</Text>
                  <Text style={styles.analyzeText}>{stripHtml(q.analyze)}</Text>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
          activeOpacity={0.8}
        >
          <Text style={styles.homeBtnText}>返回首页</Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreNum: {
    fontSize: 42,
    fontWeight: '800',
  },
  scoreSuffix: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: -4,
  },
  paperName: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  questionIdx: {
    fontSize: fontSize.md,
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
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  questionTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: 2,
  },
  optionCorrect: {
    backgroundColor: colors.secondary + '10',
  },
  optionWrong: {
    backgroundColor: colors.error + '10',
  },
  optionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  answerBox: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  answerLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  answerText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  analyzeBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  analyzeLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  analyzeText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  homeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
