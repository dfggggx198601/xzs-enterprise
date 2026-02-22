import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface TodoItem {
    id: string;
    title: string;
    completed: boolean;
}

export default function TodoScreen({ navigation }: any) {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        const loadTodos = async () => {
            try {
                const storedTodos = await AsyncStorage.getItem('@todos');
                if (storedTodos !== null) {
                    setTodos(JSON.parse(storedTodos));
                } else {
                    setTodos([
                        { id: '1', title: '完成《React Native 基础》课程学习', completed: false },
                        { id: '2', title: '进行本周的职场礼仪测验', completed: false },
                        { id: '3', title: '复习昨天错题本中的 5 道题', completed: true },
                    ]);
                }
            } catch (e) {
                console.error('Failed to load todos', e);
            }
        };
        loadTodos();
    }, []);

    const saveTodos = async (newTodos: TodoItem[]) => {
        try {
            await AsyncStorage.setItem('@todos', JSON.stringify(newTodos));
        } catch (e) {
            console.error('Failed to save todos', e);
        }
    };

    const addTodo = () => {
        if (inputText.trim()) {
            const newTodos = [
                ...todos,
                { id: Date.now().toString(), title: inputText.trim(), completed: false },
            ];
            setTodos(newTodos);
            saveTodos(newTodos);
            setInputText('');
        }
    };

    const toggleTodo = (id: string) => {
        const newTodos = todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        setTodos(newTodos);
        saveTodos(newTodos);
    };

    const deleteTodo = (id: string) => {
        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
        saveTodos(newTodos);
    };

    const renderItem = ({ item }: { item: TodoItem }) => (
        <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.checkboxContainer}>
                <MaterialCommunityIcons
                    name={item.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={24}
                    color={item.completed ? colors.primary : colors.textLight}
                />
            </TouchableOpacity>
            <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
                {item.title}
            </Text>
            <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
                <MaterialCommunityIcons name="close" size={20} color={colors.textLight} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>每日待办</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="添加新的待办事项..."
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={addTodo}
                    returnKeyType="done"
                />
                <TouchableOpacity onPress={addTodo} style={styles.addButton}>
                    <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.addButtonGradient}>
                        <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <FlatList
                data={todos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    backButton: {
        padding: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        paddingHorizontal: 20,
        fontSize: 15,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    todoText: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    todoTextCompleted: {
        textDecorationLine: 'line-through',
        color: colors.textLight,
    },
    deleteButton: {
        padding: 6,
        marginLeft: 8,
    },
});
