import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { agentApi } from '../../api';
import { colors } from '../../theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface Message {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function AiChatScreen() {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [agentId, setAgentId] = useState<number | null>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [creatingApp, setCreatingApp] = useState(false);

    const route = useRoute<any>();

    // Check if we are in runtime mode
    const isRuntime = !!route.params?.id;
    const runtimeAgentId = route.params?.id;
    const runtimeAgentName = route.params?.name || '微应用对话';
    const runtimeAgentDesc = route.params?.desc || '专属智能工作流助手';

    const [appResult, setAppResult] = useState('');

    useEffect(() => {
        if (isRuntime) {
            setAgentId(runtimeAgentId);
            return;
        }

        // Init a builder agent
        const initAgent = async () => {
            try {
                const res = await agentApi.create({
                    name: "微应用开发向导",
                    description: "通过聊天帮您创造专属AI应用",
                    systemPrompt: "你是一个AI微应用开发专家。你的任务是通过连续的对话，帮助用户梳理并创建一个专属的AI微应用（Agent）。\n请依次向用户提问，引导他们明确这个微应用的：\n1. 名字 (name)\n2. 一句话介绍 (description)\n3. 详细的行为设定、身份、专业知识和语气 (systemPrompt)\n\n在对话过程中，表现得专业、热情。当且仅当你收集齐了所有的信息，请在你回复的最后，附加上以下JSON格式的内容（必须严格被包裹在 ```json 和 ``` 之间，并且只有在确认好内容后才输出）：\n```json\n{\n  \"action\": \"create_agent\",\n  \"name\": \"应用的名字\",\n  \"description\": \"一句话介绍\",\n  \"systemPrompt\": \"你整理好的微应用系统提示词，要非常详细\"\n}\n```\n不要过早输出JSON。"
                });
                if (res.code === 1) {
                    setAgentId(res.response.id);
                    setMessages([{
                        id: Date.now(),
                        role: 'assistant',
                        content: '您好！我是您的微应用开发向导。告诉我，您今天想做一个什么样的 AI 应用？例如：英语口语陪练、小红书文案助手、或者专业的生活管家。'
                    }]);
                }
            } catch (e) {
                console.warn('Init Agent error:', e);
            }
        };
        initAgent();
    }, [isRuntime, runtimeAgentId]);

    const handleSend = async () => {
        if (!inputText.trim() || !agentId || loading) return;

        const userMsg = inputText.trim();
        setInputText('');

        const tempUserMsgId = Date.now();
        setMessages(prev => [...prev, { id: tempUserMsgId, role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const chatReq = {
                agentId: agentId,
                conversationId: conversationId,
                content: userMsg
            };
            const res = await agentApi.chat(chatReq);

            if (res.code === 1) {
                if (!conversationId && res.response.conversationId) {
                    setConversationId(res.response.conversationId);
                }
                if (isRuntime) {
                    setAppResult(res.response.content);
                } else {
                    setMessages(prev => [...prev, {
                        id: res.response.messageId || Date.now() + 1,
                        role: res.response.role || 'assistant',
                        content: res.response.content
                    }]);
                }
            } else {
                if (isRuntime) {
                    Alert.alert('执行失败', res.message);
                } else {
                    setMessages(prev => [...prev, { id: Date.now() + 2, role: 'system', content: '连接失败: ' + res.message }]);
                }
            }
        } catch (e) {
            if (isRuntime) {
                Alert.alert('网络错误', '请求超时，请重试');
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 2, role: 'system', content: '请求超时，请重试' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (appConfig: any) => {
        setCreatingApp(true);
        try {
            const res = await agentApi.create({
                name: appConfig.name,
                description: appConfig.description,
                systemPrompt: appConfig.systemPrompt
            });
            if (res.code === 1) {
                Alert.alert('🎉 部署成功', `您的微应用【${appConfig.name}】已成功发布！`);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'system',
                    content: `✨ ${appConfig.name} 发布成功！您可以随时与之对话。`
                }]);
            } else {
                Alert.alert('部署失败', res.message);
            }
        } catch (e) {
            Alert.alert('网络错误', '部署微应用时发生异常');
        } finally {
            setCreatingApp(false);
        }
    };

    const renderMessage = (msg: Message, index: number) => {
        const isUser = msg.role === 'user';
        const isSystem = msg.role === 'system';

        if (isSystem) {
            return (
                <View key={`msg-${msg.id}-${index}`} style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>{msg.content}</Text>
                </View>
            );
        }

        let displayContent = msg.content || '';
        let appConfig: any = null;

        if (!isUser) {
            const jsonMatch = displayContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const parsed = JSON.parse(jsonMatch[1]);
                    if (parsed.action === 'create_agent') {
                        appConfig = parsed;
                        displayContent = displayContent.replace(jsonMatch[0], '').trim();
                    }
                } catch (e) { }
            }
        }

        return (
            <View key={`msg-${msg.id}-${index}`} style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
                {!isUser && (
                    <View style={styles.avatarAssistant}>
                        <Icon name="robot-outline" size={20} color="#fff" />
                    </View>
                )}
                <View style={{ flexShrink: 1, maxWidth: '85%' }}>
                    {displayContent ? (
                        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant]}>
                            <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAssistant]}>
                                {displayContent}
                            </Text>
                        </View>
                    ) : null}

                    {appConfig && (
                        <View style={styles.appCard}>
                            <View style={styles.appCardHeader}>
                                <View style={styles.appIconBg}>
                                    <Icon name="cube-scan" size={22} color={colors.primary} />
                                </View>
                                <Text style={styles.appCardTitle} numberOfLines={1}>{appConfig.name}</Text>
                            </View>
                            <Text style={styles.appCardDesc}>{appConfig.description}</Text>

                            <View style={styles.appCardPromptContainer}>
                                <Text style={styles.appCardPromptLabel}>预设系统提示词</Text>
                                <Text style={styles.appCardPromptText} numberOfLines={4}>{appConfig.systemPrompt}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.deployBtn, creatingApp && { opacity: 0.7 }]}
                                onPress={() => handleCreateApp(appConfig)}
                                disabled={creatingApp}
                            >
                                {creatingApp ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Icon name="rocket-launch" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.deployBtnText}>一键发布此应用</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isRuntime) {
        return (
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: '#f8fafc' }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                    <View style={{ alignItems: 'center', marginBottom: 24, paddingTop: 16 }}>
                        <Icon name="cube-scan" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 }}>{runtimeAgentName}</Text>
                        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 20 }}>{runtimeAgentDesc}</Text>
                    </View>

                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 24 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 }}>工作流输入区</Text>
                        <TextInput
                            style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, minHeight: 120, fontSize: 15, color: '#334155', textAlignVertical: 'top' }}
                            placeholder="请详细提供被处理素材或执行步骤要求（支持长文本粘贴）..."
                            multiline
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity
                            style={[{ backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center' }, loading && { opacity: 0.7 }]}
                            onPress={handleSend}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : <Icon name="magic-staff" size={20} color="#fff" style={{ marginRight: 8 }} />}
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{loading ? '工作流执行中...' : '开始执行工作流'}</Text>
                        </TouchableOpacity>
                    </View>

                    {(appResult || loading) && (
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 40 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 }}>生成与处理结果</Text>
                            <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, minHeight: 100 }}>
                                {loading ? (
                                    <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
                                ) : (
                                    <Text style={{ fontSize: 15, color: '#334155', lineHeight: 24 }}>{appResult}</Text>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                <View style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>由 Gemini 3.1 Pro 强力驱动微应用工坊</Text>
                </View>

                {messages.map((msg, index) => renderMessage(msg, index))}

                {loading && (
                    <View style={[styles.messageRow, styles.messageRowAssistant]}>
                        <View style={styles.avatarAssistant}>
                            <Icon name="robot-outline" size={20} color="#fff" />
                        </View>
                        <View style={[styles.messageBubble, styles.messageBubbleAssistant, { paddingVertical: 12 }]}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="告诉向导您的想法..."
                        multiline
                        maxLength={1000}
                        editable={!loading && agentId !== null}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.sendButton, (!inputText.trim() || loading || agentId === null) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || loading || agentId === null}
                >
                    <Icon name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    chatArea: { flex: 1 },
    chatContent: { padding: 15, paddingBottom: 20 },
    systemMessageContainer: { alignItems: 'center', marginVertical: 10 },
    systemMessageText: {
        fontSize: 12, color: '#999', backgroundColor: '#EBEBEB',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden'
    },
    messageRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowAssistant: { justifyContent: 'flex-start' },
    avatarAssistant: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 0
    },
    messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginBottom: 4 },
    messageBubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    messageBubbleAssistant: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EFEFEF' },
    messageText: { fontSize: 16, lineHeight: 22 },
    messageTextUser: { color: '#FFFFFF' },
    messageTextAssistant: { color: '#333333' },
    inputArea: {
        flexDirection: 'row', padding: 10, paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E0E0E0', alignItems: 'flex-end'
    },
    inputContainer: {
        flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8,
        marginRight: 10, minHeight: 40, maxHeight: 120
    },
    input: { fontSize: 16, color: '#333', maxHeight: 100 },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { backgroundColor: '#B0BEC5' },

    // AI App Card Styles
    appCard: {
        backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginTop: 8,
        borderWidth: 1, borderColor: 'rgba(74, 108, 247, 0.2)', width: '100%',
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    appCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    appIconBg: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(74, 108, 247, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    appCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E2A4A', flex: 1 },
    appCardDesc: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
    appCardPromptContainer: { backgroundColor: '#F8F9FA', padding: 10, borderRadius: 6, marginBottom: 14 },
    appCardPromptLabel: { fontSize: 11, fontWeight: '600', color: '#9AA5BE', marginBottom: 4 },
    appCardPromptText: { fontSize: 12, color: '#444', lineHeight: 18, fontStyle: 'italic' },
    deployBtn: {
        backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center'
    },
    deployBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' }
});
