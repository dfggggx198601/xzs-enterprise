import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { questionAnswerApi } from '../../api';
import { questionTypeLabel } from '../../utils';

const STREAK_KEY_PREFIX = 'wrong_streak_';

export default function QuestionDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const res = await questionAnswerApi.select(id);
      if (res.code === 1) setData(res.response);
    } catch { } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }
  if (!data) {
    return <View style={styles.center}><Text style={styles.errorText}>加载失败</Text></View>;
  }

  const question = data.questionVM;
  const answerVM = data.questionAnswerVM;
  const questionType = question?.questionType;
  const items = question?.items || question?.questionItems || [];
  const isChoiceType = [1, 2, 3].includes(questionType);
  const isMultiple = questionType === 2;

  const correctAnswerStr = question?.correct || question?.correctAnswer || '';
  const correctAnswer = correctAnswerStr.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean);

  const toggleAnswer = (letter: string) => {
    if (submitted) return;
    if (isMultiple) {
      setSelectedAnswers(prev =>
        prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter].sort()
      );
    } else {
      setSelectedAnswers([letter]);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswers.length === 0) {
      Alert.alert('提示', '请选择答案');
      return;
    }
    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...correctAnswer].sort();
    const correct = sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((v, i) => v === sortedCorrect[i]);

    setIsCorrect(correct);
    setSubmitted(true);

    const key = `${STREAK_KEY_PREFIX}${id}`;
    if (correct) {
      const prev = parseInt(await AsyncStorage.getItem(key) || '0', 10);
      await AsyncStorage.setItem(key, String(prev + 1));
    } else {
      await AsyncStorage.setItem(key, '0');
    }
  };

  const getOptionStyle = (letter: string) => {
    const selected = selectedAnswers.includes(letter);
    const isCorrectOpt = correctAnswer.includes(letter);
    if (!submitted) return selected ? styles.optionSelected : styles.optionDefault;
    if (isCorrectOpt) return styles.optionCorrect;
    if (selected && !isCorrectOpt) return styles.optionWrong;
    return styles.optionDefault;
  };

  const getOptionIconStyle = (letter: string) => {
    const selected = selectedAnswers.includes(letter);
    const isCorrectOpt = correctAnswer.includes(letter);
    if (!submitted) return selected ? styles.iconSelected : styles.iconDefault;
    if (isCorrectOpt) return styles.iconCorrect;
    if (selected && !isCorrectOpt) return styles.iconWrong;
    return styles.iconDefault;
  };

  const getAnswerDisplay = (answerStr: string | undefined) => {
    if (!answerStr) return '未作答';
    if (!items || items.length === 0) return answerStr;
    const letters = answerStr.split(',').map((s: string) => s.trim().toUpperCase());
    return letters.map((char: string) => {
      if (char.length !== 1) return char;
      const index = char.charCodeAt(0) - 65;
      if (index >= 0 && index < items.length && items[index]) {
        return `${char}. ${items[index].content || ''}`;
      }
      return char;
    }).join('\n');
  };

  if (!isChoiceType) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentPad}>
          <View style={styles.header}>
            <View style={[styles.typeBadge, { backgroundColor: '#e0e7ff' }]}>
              <Text style={[styles.typeBadgeText, { color: '#4f46e5' }]}>
                {questionTypeLabel(questionType)}
              </Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.questionText}>{question?.title}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>正确答案</Text>
            <Text style={styles.analyzeText}>{correctAnswerStr || '暂无'}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>解析</Text>
            <Text style={styles.analyzeText}>{question?.analyze || '暂无解析'}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentPad}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: '#e0e7ff' }]}>
            <Text style={[styles.typeBadgeText, { color: '#4f46e5' }]}>
              {questionTypeLabel(questionType)}
            </Text>
          </View>
          {isMultiple && !submitted && (
            <Text style={styles.hint}>多选题，请选择所有正确选项</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.questionText}>{question?.title}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {items.map((item: any, index: number) => {
            const letter = item.prefix || String.fromCharCode(65 + index);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.optionRow, getOptionStyle(letter)]}
                onPress={() => toggleAnswer(letter)}
                disabled={submitted}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, getOptionIconStyle(letter)]}>
                  {selectedAnswers.includes(letter) && (!submitted) && <View style={styles.optionIconDot} />}
                  {submitted && correctAnswer.includes(letter) && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                  {submitted && selectedAnswers.includes(letter) && !correctAnswer.includes(letter) && <MaterialCommunityIcons name="close" size={14} color="#fff" />}
                </View>
                <Text style={styles.optionLabel}>{letter}. {item.content || ''}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {submitted && (
          <View style={styles.resultSection}>
            <View style={[styles.resultBanner, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
              <MaterialCommunityIcons
                name={isCorrect ? 'check-circle' : 'close-circle'}
                size={28}
                color={isCorrect ? '#22c55e' : '#ef4444'}
              />
              <Text style={[styles.resultText, { color: isCorrect ? '#16a34a' : '#dc2626' }]}>
                {isCorrect ? '回答正确！' : '回答错误'}
              </Text>
            </View>

            {!isCorrect && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>正确答案</Text>
                <Text style={[styles.answerText, styles.correctText]}>
                  {getAnswerDisplay(correctAnswerStr)}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>解析</Text>
              <Text style={styles.analyzeText}>{question?.analyze || '暂无解析'}</Text>
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.backBtnText}>返回错题列表</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!submitted && (
        <View style={styles.submitBar}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitText}>提交答案</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentPad: { paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ef4444', fontSize: 16 },
  header: { padding: 24, paddingBottom: 16 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 13, color: '#f59e0b', marginTop: 8 },
  section: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  questionText: { fontSize: 17, color: '#0f172a', lineHeight: 28, fontWeight: '500' },

  optionsContainer: { paddingHorizontal: 24, gap: 12 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  optionDefault: { borderColor: 'rgba(0,0,0,0.05)' },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },

  optionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDefault: { borderColor: '#cbd5e1', backgroundColor: 'transparent' },
  iconSelected: { borderColor: '#2563eb', backgroundColor: '#2563eb' },
  iconCorrect: { borderColor: '#22c55e', backgroundColor: '#22c55e' },
  iconWrong: { borderColor: '#ef4444', backgroundColor: '#ef4444' },
  optionIconDot: { width: 10, height: 10, backgroundColor: '#fff', borderRadius: 5 },

  optionLabel: { fontSize: 16, color: '#0f172a', flex: 1, lineHeight: 24 },

  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  resultSection: { paddingBottom: 40 },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
  },
  resultCorrect: { backgroundColor: '#dcfce7' },
  resultWrong: { backgroundColor: '#fee2e2' },
  resultText: { fontSize: 18, fontWeight: '700' },
  answerText: { fontSize: 16, color: '#0f172a' },
  correctText: { color: '#16a34a', fontWeight: '500' },
  analyzeText: { fontSize: 15, color: '#64748b', lineHeight: 24 },
  backBtn: {
    marginHorizontal: 24,
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  backBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
});
