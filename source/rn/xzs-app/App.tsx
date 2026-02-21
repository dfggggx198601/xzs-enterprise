import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { paperTheme, colors } from './src/theme';

import LoginScreen from './src/screens/login';
import DashboardScreen from './src/screens/dashboard';
import ExamListScreen from './src/screens/exams';
import RecordsScreen from './src/screens/records';
import WrongQuestionsScreen from './src/screens/wrong-questions';
import ProfileScreen from './src/screens/profile';
import ExamTakingScreen from './src/screens/exam-taking';
import ExamResultScreen from './src/screens/exam-result';
import MessagesScreen from './src/screens/messages';
import DailyPracticeScreen from './src/screens/daily-practice';
import DailyPracticeTakingScreen from './src/screens/daily-practice/taking';
import UpdateChecker from './src/components/UpdateChecker';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ExamTaking: { id: number };
  ExamResult: { id: number; score?: number };
  Messages: undefined;
  DailyPractice: undefined;
  DailyPracticeTaking: { id: number };
};

type TabParamList = {
  Dashboard: undefined;
  ExamList: undefined;
  Records: undefined;
  WrongQuestions: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<string, { focused: string; unfocused: string }> = {
  Dashboard: { focused: 'view-dashboard', unfocused: 'view-dashboard-outline' },
  ExamList: { focused: 'file-document', unfocused: 'file-document-outline' },
  Records: { focused: 'history', unfocused: 'history' },
  WrongQuestions: { focused: 'book-alert', unfocused: 'book-alert-outline' },
  Profile: { focused: 'account-circle', unfocused: 'account-circle-outline' },
};

const tabLabels: Record<string, string> = {
  Dashboard: '首页',
  ExamList: '试卷',
  Records: '记录',
  WrongQuestions: '错题',
  Profile: '我的',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: tabLabels[route.name],
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarLabel: tabLabels[route.name],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 56,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="ExamList" component={ExamListScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="WrongQuestions" component={WrongQuestionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="ExamTaking"
            component={ExamTakingScreen}
            options={{ gestureEnabled: false, animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ExamResult"
            component={ExamResultScreen}
            options={{ gestureEnabled: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Messages"
            component={MessagesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="DailyPractice"
            component={DailyPracticeScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="DailyPracticeTaking"
            component={DailyPracticeTakingScreen}
            options={{ gestureEnabled: false, animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={LoginScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <UpdateChecker />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
