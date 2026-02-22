import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://exam.440700.xyz';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  response: T;
}

class ApiClient {
  private client: AxiosInstance;
  private cookie: string | null = null;
  private clearingSession: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'request-ajax': 'true',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      if (!this.cookie) {
        this.cookie = await AsyncStorage.getItem('session_cookie');
      }
      if (this.cookie) {
        config.headers.Cookie = this.cookie;
      }
      return config;
    });

    this.client.interceptors.response.use(
      async (response: AxiosResponse) => {
        const setCookie = response.headers['set-cookie'];
        if (setCookie && !this.clearingSession) {
          const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
          this.cookie = cookieStr;
          await AsyncStorage.setItem('session_cookie', cookieStr);
        }
        return response;
      },
      (error) => {
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('请求超时，请重试'));
        }
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          return Promise.reject(new Error('网络连接失败，请检查网络'));
        }
        return Promise.reject(error);
      }
    );
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    const result = response.data;
    if (result.code === 401 || result.code === 502) {
      await this.clearSession();
      throw new Error('SESSION_EXPIRED');
    }
    if (result.code === 500 || result.code === 501) {
      throw new Error(result.message || '请求失败');
    }
    return result;
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async clearSession() {
    this.clearingSession = true;
    this.cookie = null;
    await AsyncStorage.removeItem('session_cookie');
    this.clearingSession = false;
  }

  setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }
}

export const apiClient = new ApiClient();

export const authApi = {
  login: (data: { userName: string; password: string; remember: boolean }) =>
    apiClient.post('/api/user/login', data),
  logout: () => apiClient.post('/api/user/logout'),
};

export const dashboardApi = {
  index: () => apiClient.post('/api/student/dashboard/index'),
};

export const examPaperApi = {
  pageList: (query: any) => apiClient.post('/api/student/exam/paper/pageList', query),
  select: (id: number) => apiClient.post(`/api/student/exam/paper/select/${id}`),
};

export const examPaperAnswerApi = {
  pageList: (query: any) => apiClient.post('/api/student/exampaper/answer/pageList', query),
  answerSubmit: (form: any) => apiClient.post('/api/student/exampaper/answer/answerSubmit', form),
  read: (id: number) => apiClient.post(`/api/student/exampaper/answer/read/${id}`),
  edit: (form: any) => apiClient.post('/api/student/exampaper/answer/edit', form),
};

export const questionAnswerApi = {
  pageList: (query: any) => apiClient.post('/api/student/question/answer/page', query),
  select: (id: number) => apiClient.post(`/api/student/question/answer/select/${id}`),
  delete: (id: number) => apiClient.post(`/api/student/question/answer/delete/${id}`),
};

export const userApi = {
  getCurrentUser: () => apiClient.post('/api/student/user/current'),
  update: (query: any) => apiClient.post('/api/student/user/update', query),
  updatePwd: (query: any) => apiClient.post('/api/student/user/updatePwd', query),
  getUserEvent: () => apiClient.post('/api/student/user/log'),
  messagePageList: (query: any) => apiClient.post('/api/student/user/message/page', query),
  readMessage: (id: number) => apiClient.post(`/api/student/user/message/read/${id}`),
  getMessageCount: () => apiClient.post('/api/student/user/message/unreadCount'),
};

export const subjectApi = {
  list: () => apiClient.post('/api/student/education/subject/list'),
  select: (id: number) => apiClient.post(`/api/student/education/subject/select/${id}`),
};

export const dailyPracticeApi = {
  list: () => apiClient.post('/api/student/dailyPractice/list'),
  start: (id: number) => apiClient.post(`/api/student/dailyPractice/start/${id}`),
  submit: (data: any) => apiClient.post('/api/student/dailyPractice/submit', data),
  history: (query: any) => apiClient.post('/api/student/dailyPractice/history', query),
};

export const appVersionApi = {
  check: () => apiClient.post('/api/student/app/version'),
};
