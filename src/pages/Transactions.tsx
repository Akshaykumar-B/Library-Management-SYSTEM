import { useState, useEffect } from "react";
import { api } from "@/db/api";
import type { TransactionWithDetails } from "@/types/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { History } from "lucide-react";
import { format } from "date-fns";

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = profile?.role === 'staff'
          ? await api.getAllTransactions()
          : await api.getUserTransactions(user.id);
        setTransactions(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user, profile]);

  const getActionBadge = (action: string) => {
    if (action === 'borrow') {
      return <Badge className="bg-info text-info-foreground">Borrowed</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">Returned</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground">
          {profile?.role === 'staff' 
            ? 'View all library transactions' 
            : 'View your borrowing and return history'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No transactions found</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Total: {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {profile?.role === 'staff' && <TableHead>User</TableHead>}
                    <TableHead>Book ID</TableHead>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(transaction.transaction_date), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      {profile?.role === 'staff' && (
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{transaction.user?.username}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {transaction.user?.role}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="font-mono text-sm">
                        {transaction.book?.book_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.book?.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.book?.author}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(transaction.action)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
