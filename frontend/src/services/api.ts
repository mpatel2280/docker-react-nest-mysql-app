import axios from 'axios';

// Use environment variable or default to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse extends User {
  accessToken: string;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginDto) => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    const { accessToken, ...user } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
  register: async (data: RegisterDto) => {
    const response = await api.post<User>('/users', {
      email: data.email,
      name: data.name,
      password: data.password,
    });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// User API
export const userApi = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  create: async (data: CreateUserDto) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
  update: async (id: number, data: UpdateUserDto) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
};

export default api;

