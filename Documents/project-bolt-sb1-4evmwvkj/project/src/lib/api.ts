import { supabase, API_URL } from './supabase';
import { Author, Book, Profile, Borrowing } from '../types';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
};

export const authorsApi = {
  getAll: async (): Promise<Author[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/authors`, { headers });
    if (!response.ok) throw new Error('Failed to fetch authors');
    return response.json();
  },

  getById: async (id: string): Promise<Author> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/authors/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch author');
    return response.json();
  },

  create: async (data: { name: string; bio: string }): Promise<Author> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/authors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create author');
    return response.json();
  },

  update: async (id: string, data: Partial<Author>): Promise<Author> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/authors/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update author');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/authors/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete author');
  },
};

export const booksApi = {
  getAll: async (filters?: { author_id?: string; available?: boolean; search?: string }): Promise<Book[]> => {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (filters?.author_id) params.append('author_id', filters.author_id);
    if (filters?.available !== undefined) params.append('available', String(filters.available));
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_URL}/books${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  },

  getById: async (id: string): Promise<Book> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/books/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch book');
    return response.json();
  },

  create: async (data: {
    title: string;
    isbn: string;
    author_id: string;
    description: string;
    published_year: number;
  }): Promise<Book> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create book');
    return response.json();
  },

  update: async (id: string, data: Partial<Book>): Promise<Book> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update book');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete book');
  },
};

export const usersApi = {
  getAll: async (): Promise<Profile[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users`, { headers });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getById: async (id: string): Promise<Profile> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  create: async (data: {
    email: string;
    password: string;
    full_name: string;
  }): Promise<Profile> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },
};

export const borrowingsApi = {
  getAll: async (filters?: { user_id?: string; active_only?: boolean }): Promise<Borrowing[]> => {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.active_only) params.append('active_only', 'true');

    const url = `${API_URL}/borrowings${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch borrowings');
    return response.json();
  },

  borrow: async (data: {
    book_id: string;
    user_id: string;
    due_days?: number;
  }): Promise<Borrowing> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/borrowings/borrow`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to borrow book');
    }
    return response.json();
  },

  return: async (borrowing_id: string): Promise<Borrowing> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/borrowings/return`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ borrowing_id }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to return book');
    }
    return response.json();
  },
};
