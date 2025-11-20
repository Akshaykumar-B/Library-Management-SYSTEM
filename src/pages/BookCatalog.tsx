import { useState, useEffect } from "react";
import { api } from "@/db/api";
import type { Book } from "@/types/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, BookOpen, User } from "lucide-react";

export default function BookCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [borrowingBook, setBorrowingBook] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = searchQuery 
        ? await api.searchBooks(searchQuery)
        : await api.getAllBooks();
      setBooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [searchQuery]);

  const handleBorrow = async (bookId: string) => {
    if (!profile) return;

    setBorrowingBook(bookId);
    try {
      const result = await api.borrowBook(bookId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        await loadBooks();
      } else {
        toast({
          title: "Cannot Borrow",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to borrow book",
        variant: "destructive"
      });
    } finally {
      setBorrowingBook(null);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock <= 2) {
      return <Badge className="bg-warning text-warning-foreground">Low Stock ({stock})</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">Available ({stock})</Badge>;
  };

  const getRoleLimit = () => {
    if (!profile) return 0;
    switch (profile.role) {
      case 'student': return 3;
      case 'teacher': return 5;
      case 'staff': return 999;
      default: return 0;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Book Catalog</h1>
            <p className="text-muted-foreground mt-1">
              Browse and borrow books from our collection
            </p>
          </div>
          {profile && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{profile.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile.role} • Limit: {getRoleLimit()} books
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or book ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : books.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No books found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription className="mt-1">by {book.author}</CardDescription>
                  </div>
                  {getStockBadge(book.stock)}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Book ID:</span>
                    <span className="font-medium">{book.book_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{book.stock} copies</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleBorrow(book.id)}
                  disabled={book.stock === 0 || borrowingBook === book.id}
                  className="w-full"
                  variant={book.stock === 0 ? "outline" : "default"}
                >
                  {borrowingBook === book.id ? "Borrowing..." : book.stock === 0 ? "Out of Stock" : "Borrow Book"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
