import { supabase } from "./supabase";
import type { Profile, Book, Transaction, TransactionWithDetails, BorrowedBook, ActiveUser } from "@/types/types";

export const api = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getActiveUsers(): Promise<ActiveUser[]> {
    const { data, error } = await supabase
      .from("active_users")
      .select("*");
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    
    if (error) throw error;
  },

  async getAllBooks(): Promise<Book[]> {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("book_id", { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async searchBooks(query: string): Promise<Book[]> {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,book_id.ilike.%${query}%`)
      .order("book_id", { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBook(bookId: string): Promise<Book | null> {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createBook(book: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book> {
    const { data, error } = await supabase
      .from("books")
      .insert(book)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBook(bookId: string, updates: Partial<Book>): Promise<void> {
    const { error } = await supabase
      .from("books")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", bookId);
    
    if (error) throw error;
  },

  async deleteBook(bookId: string): Promise<void> {
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);
    
    if (error) throw error;
  },

  async borrowBook(bookId: string): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase.rpc("borrow_book", { p_book_id: bookId });
    
    if (error) throw error;
    return data as { success: boolean; message: string };
  },

  async returnBook(bookId: string): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase.rpc("return_book", { p_book_id: bookId });
    
    if (error) throw error;
    return data as { success: boolean; message: string };
  },

  async getUserBorrowCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc("get_user_borrow_count", { p_user_id: userId });
    
    if (error) throw error;
    return data || 0;
  },

  async getUserTransactions(userId: string): Promise<TransactionWithDetails[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        book:books(*),
        user:profiles(*)
      `)
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAllTransactions(): Promise<TransactionWithDetails[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        book:books(*),
        user:profiles(*)
      `)
      .order("transaction_date", { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getCurrentBorrowedBooks(userId: string): Promise<BorrowedBook[]> {
    const transactions = await this.getUserTransactions(userId);
    
    const borrowedBooks: Map<string, BorrowedBook> = new Map();
    
    // Process transactions from oldest to newest to get current state
    const reversedTransactions = [...transactions].reverse();
    
    for (const transaction of reversedTransactions) {
      if (!transaction.book) continue;
      
      const bookId = transaction.book.id;
      
      if (transaction.action === 'borrow') {
        borrowedBooks.set(bookId, {
          book: transaction.book,
          borrow_date: transaction.transaction_date
        });
      } else if (transaction.action === 'return') {
        borrowedBooks.delete(bookId);
      }
    }
    
    return Array.from(borrowedBooks.values());
  }
};
