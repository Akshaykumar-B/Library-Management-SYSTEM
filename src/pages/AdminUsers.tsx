import { useState, useEffect } from "react";
import { api } from "@/db/api";
import { supabase } from "@/db/supabase";
import type { Profile, ActiveUser } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsers, active] = await Promise.all([
        api.getAllProfiles(),
        api.getActiveUsers()
      ]);
      setUsers(allUsers);
      setActiveUsers(active);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUser(userId);
    try {
      await api.updateUserRole(userId, newRole);
      toast({
        title: "Success",
        description: "User role updated successfully"
      });
      await loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteAllUsers = async () => {
    setDeletingAll(true);
    try {
      const result = await api.deleteAllUsers();
      
      toast({
        title: "Success",
        description: `${result.deleted_count} users deleted successfully. You will be logged out.`,
      });

      // Sign out current user
      await supabase.auth.signOut();
      
      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete users",
        variant: "destructive"
      });
      setDeletingAll(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'staff':
        return <Badge className="bg-primary text-primary-foreground">Staff</Badge>;
      case 'teacher':
        return <Badge className="bg-secondary text-secondary-foreground">Teacher</Badge>;
      case 'student':
        return <Badge variant="outline">Student</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getRoleLimit = (role: string) => {
    switch (role) {
      case 'student': return 3;
      case 'teacher': return 5;
      case 'staff': return 'Unlimited';
      default: return 0;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deletingAll || users.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Users
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete All Users?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p className="font-semibold text-foreground">
                    ⚠️ This action cannot be undone!
                  </p>
                  <p>
                    This will permanently delete <strong>all {users.length} users</strong> from the system, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All user accounts and profiles</li>
                    <li>All authentication data</li>
                    <li>All user sessions</li>
                  </ul>
                  <p className="text-destructive font-semibold">
                    You will be logged out immediately after deletion.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The next user to register will become the new staff (admin).
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deletingAll}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllUsers}
                  disabled={deletingAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletingAll ? "Deleting..." : "Yes, Delete All Users"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Active Users Alert */}
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Active Users (Logged in within last 30 minutes)
          <Badge variant="default">{activeUsers.length}</Badge>
        </AlertTitle>
        <AlertDescription>
          {activeUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users currently active</p>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {activeUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="text-sm">
                    {user.username} ({user.role})
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {format(new Date(), 'HH:mm:ss')}
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Now</CardDescription>
            <CardTitle className="text-3xl text-green-600">{activeUsers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Staff Members</CardDescription>
            <CardTitle className="text-3xl">{users.filter(u => u.role === 'staff').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Students</CardDescription>
            <CardTitle className="text-3xl">{users.filter(u => u.role === 'student').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage roles and view user information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Borrow Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isActive = activeUsers.some(au => au.id === user.id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {getRoleLimit(user.role)} books
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <Badge variant="default" className="bg-green-600">
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.last_login_at 
                            ? format(new Date(user.last_login_at), "MMM dd, HH:mm")
                            : "Never"
                          }
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={updatingUser === user.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
