import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';
import { APP_VERSION } from '../../components/UpdateChecker';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigation = useNavigation<any>();
  const [editing, setEditing] = useState(false);
  const [realName, setRealName] = useState(user?.realName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userApi.update({ realName, phone });
      if (res.code === 1) {
        await refreshUser();
        setEditing(false);
        Alert.alert('提示', '保存成功');
      }
    } catch {
      Alert.alert('提示', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'shield-check-outline' as const, label: '修改密码', onPress: () => navigation.navigate('ChangePassword') },
    { icon: 'information-outline' as const, label: '关于我们', onPress: () => Alert.alert('企业考试', `v${APP_VERSION}\n员工在线考试平台`) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{(user?.realName || '员')[0]}</Text>
        </View>
        {editing ? (
          <View style={styles.editForm}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>姓名</Text>
              <TextInput
                style={styles.fieldInput}
                value={realName}
                onChangeText={setRealName}
                placeholder="请输入姓名"
                placeholderTextColor={colors.textLight}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>手机</Text>
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="请输入手机号"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.editBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? '保存中...' : '保存'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.userName}>{user?.realName || '员工'}</Text>
            <Text style={styles.userAccount}>{user?.userName || ''}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
              <Text style={styles.editBtnText}>编辑资料</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name={item.icon} size={22} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.primary },
  userName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  userAccount: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
  },
  editBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '500' },
  editForm: { width: '100%', marginTop: spacing.md },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fieldLabel: { width: 50, fontSize: fontSize.sm, color: colors.textSecondary },
  fieldInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  editBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: fontSize.md, color: colors.textSecondary },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { fontSize: fontSize.md, color: '#FFFFFF', fontWeight: '600' },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuLabel: { fontSize: fontSize.md, color: colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  logoutText: { fontSize: fontSize.md, color: colors.error, fontWeight: '500' },
});
