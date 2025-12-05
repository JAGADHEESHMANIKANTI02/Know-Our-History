export interface Author {
  id: string;
  name: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author_id: string;
  description: string;
  published_year: number;
  available: boolean;
  created_at: string;
  updated_at: string;
  author?: Author;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  created_at: string;
  book?: Book;
  user?: Profile;
}
