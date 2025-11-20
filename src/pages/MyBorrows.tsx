import { useState, useEffect } from "react";
import { api } from "@/db/api";
import type { BorrowedBook } from "@/types/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function MyBorrows() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningBook, setReturningBook] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const loadBorrowedBooks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await api.getCurrentBorrowedBooks(user.id);
      setBorrowedBooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load borrowed books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowedBooks();
  }, [user]);

  const handleReturn = async (bookId: string) => {
    setReturningBook(bookId);
    try {
      const result = await api.returnBook(bookId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        await loadBorrowedBooks();
      } else {
        toast({
          title: "Cannot Return",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive"
      });
    } finally {
      setReturningBook(null);
    }
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">My Borrowed Books</h1>
        <p className="text-muted-foreground">
          Manage your currently borrowed books
        </p>
        {profile && (
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="text-sm">
              Currently Borrowed: {borrowedBooks.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Limit: {getRoleLimit()} books
            </Badge>
            <Badge 
              variant={borrowedBooks.length >= getRoleLimit() ? "destructive" : "default"}
              className="text-sm"
            >
              Available Slots: {Math.max(0, getRoleLimit() - borrowedBooks.length)}
            </Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : borrowedBooks.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-2">No borrowed books</p>
          <p className="text-sm text-muted-foreground">
            Visit the Book Catalog to borrow books
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {borrowedBooks.map(({ book, borrow_date }) => (
            <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription className="mt-1">by {book.author}</CardDescription>
                  </div>
                  <Badge className="bg-info text-info-foreground">Borrowed</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Book ID:</span>
                    <span className="font-medium">{book.book_id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">
                      Borrowed on {format(new Date(borrow_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleReturn(book.id)}
                  disabled={returningBook === book.id}
                  className="w-full"
                  variant="secondary"
                >
                  {returningBook === book.id ? "Returning..." : "Return Book"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
