const API_URL = 'https://functions.poehali.dev/5cead9f1-4ea0-437f-836e-c5e9e9781cd6';

export interface User {
  id: number;
  email: string;
  nickname: string;
  discord?: string;
  team?: string;
  avatar_url?: string;
  role: string;
  is_organizer?: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  session_token: string;
}

export const authService = {
  async register(email: string, password: string, nickname: string, discord?: string, team?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname, discord, team })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('session_token', data.session_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('session_token', data.session_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('session_token');
    if (token) {
      await fetch(`${API_URL}?action=logout`, {
        method: 'POST',
        headers: { 'X-Session-Token': token }
      });
    }
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
  },

  async getProfile(): Promise<User> {
    const token = localStorage.getItem('session_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}?action=profile`, {
      method: 'GET',
      headers: { 'X-Session-Token': token }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },

  async updateProfile(updates: Partial<Pick<User, 'nickname' | 'discord' | 'team' | 'avatar_url'>>): Promise<User> {
    const token = localStorage.getItem('session_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}?action=profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-Token': token 
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('session_token');
  }
};