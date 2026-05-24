import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../theme';
import { userApi } from '../../api';

export default function ChangePasswordScreen({ navigation }: any) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!password) {
            Alert.alert('提示', '请输入新密码');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('提示', '两次输入的密码不一致');
            return;
        }

        setSaving(true);
        try {
            const res = await userApi.updatePwd({ password });
            if (res.code === 1) {
                Alert.alert('提示', '密码修改成功，请重新登录', [
                    { text: '确定', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('提示', res.message || '修改密码失败');
            }
        } catch {
            Alert.alert('提示', '修改密码失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>修改密码</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>新密码</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textLight} />
                            <TextInput
                                style={styles.input}
                                placeholder="请输入新密码"
                                placeholderTextColor={colors.textLight}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>确认新密码</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="lock-check-outline" size={20} color={colors.textLight} />
                            <TextInput
                                style={styles.input}
                                placeholder="请再次输入新密码"
                                placeholderTextColor={colors.textLight}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, (!password || password !== confirmPassword) && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving || !password || password !== confirmPassword}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveBtnText}>{saving ? '提交中...' : '确认修改'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
    },
    backButton: {
        padding: spacing.xs,
    },
    content: {
        padding: spacing.lg,
    },
    formCard: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        ...shadows.sm,
    },
    inputGroup: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: spacing.sm,
        fontSize: fontSize.md,
        color: colors.text,
    },
    saveBtn: {
        backgroundColor: colors.primary,
        height: 48,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
        ...shadows.sm,
    },
    saveBtnDisabled: {
        backgroundColor: colors.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    saveBtnText: {
        color: '#ffffff',
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
