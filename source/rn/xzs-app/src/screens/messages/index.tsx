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
import { userApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';

export default function MessagesScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async (page: number, refresh = false) => {
    if (loading && !refresh) return;
    setLoading(true);
    try {
      const res = await userApi.messagePageList({ pageIndex: page, pageSize: 20 });
      if (res.code === 1) {
        const list = res.response?.list || [];
        setMessages(refresh ? list : [...messages, ...list]);
        setTotal(res.response?.total || 0);
        setPageIndex(page);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [loading, messages]);

  useEffect(() => {
    loadMessages(1, true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages(1, true);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: item.readed ? colors.surfaceVariant : colors.primary + '15' }]}>
        <MaterialCommunityIcons
          name={item.readed ? 'email-open-outline' : 'email-outline'}
          size={22}
          color={item.readed ? colors.textLight : colors.primary}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, !item.readed && styles.cardTitleUnread]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
        <Text style={styles.cardTime}>{item.createTime}</Text>
      </View>
      {!item.readed && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={() => messages.length < total && loadMessages(pageIndex + 1)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="email-off-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>暂无消息</Text>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: fontSize.md, color: colors.text, marginBottom: 4 },
  cardTitleUnread: { fontWeight: '700' },
  cardContent: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  cardTime: { fontSize: fontSize.xs, color: colors.textLight },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginTop: 6,
    marginLeft: spacing.sm,
  },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, marginTop: spacing.md },
});
