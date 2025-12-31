const API_BASE = ''; // 使用相对路径，适配本地代理和生产环境

export interface User {
  id: string;
  email: string;
  avatar_url: string | null;
}

interface AuthResponse {
  token: string;
  user: User;
  error?: string;
}

const AUTH_TOKEN_STORAGE_KEY = 'ogsprite_auth_token';
const AUTH_TOKEN_STORAGE_KEY_LEGACY = 'ogspirit_auth_token';

class AuthService {
  private token: string | null = null;

  constructor() {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      this.token = token;
      return;
    }

    const legacyToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY_LEGACY);
    if (legacyToken) {
      this.token = legacyToken;
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, legacyToken);
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY_LEGACY);
      return;
    }

    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      // 强制使用相对路径，走 Vite 代理
      const response = await fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!response.ok) {
        this.clearToken();
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '登录失败');
    }

    this.setToken(data.token);
    return data.user;
  }

  async register(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '注册失败');
    }

    this.setToken(data.token);
    return data.user;
  }

  logout(): void {
    this.clearToken();
  }
}

export const authService = new AuthService();
