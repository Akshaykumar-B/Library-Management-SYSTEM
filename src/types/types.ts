export type UserRole = 'student' | 'teacher' | 'staff';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
  last_login_at?: string;
}

export interface ActiveUser {
  id: string;
  username: string;
  role: UserRole;
  last_login_at: string;
}

export interface Book {
  id: string;
  book_id: string;
  title: string;
  author: string;
  stock: number;
  content?: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  book_id: string;
  action: 'borrow' | 'return';
  transaction_date: string;
}

export interface TransactionWithDetails extends Transaction {
  book?: Book;
  user?: Profile;
}

export interface BorrowedBook {
  book: Book;
  borrow_date: string;
}
