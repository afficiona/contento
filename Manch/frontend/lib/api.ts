const API_BASE_URL = 'http://localhost:3000/api';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: number;
  user_name?: string;
  user_email?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private getHeaders(includeAuth = false) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('manch_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async register(email: string, password: string, name: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('manch_token', data.token);
    localStorage.setItem('manch_user', JSON.stringify(data.user));
    return data;
  }

  async getPosts(): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  }

  async getMyPosts(): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/posts/my`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your posts');
    }

    return response.json();
  }

  async createPost(content: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem('manch_token');
    localStorage.removeItem('manch_user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('manch_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('manch_token');
  }
}

export const api = new ApiClient();
