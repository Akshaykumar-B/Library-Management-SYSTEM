import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Info } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUsername(loginUsername)) {
      toast({
        title: "Invalid Username",
        description: "Username can only contain letters, numbers, and underscores",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const email = `${loginUsername}@miaoda.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword
      });

      if (error) throw error;

      toast({
        title: "Login Successful",
        description: "Welcome back to the library!"
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(signupUsername)) {
      toast({
        title: "Invalid Username",
        description: "Username can only contain letters, numbers, and underscores",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const email = `${signupUsername}@miaoda.com`;
      const { error } = await supabase.auth.signUp({
        email,
        password: signupPassword
      });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Logging you in..."
      });

      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Library Management System</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
            
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only letters, numbers, and underscores allowed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    First registered user becomes staff (admin)
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>User Roles & Permissions</AlertTitle>
          <AlertDescription className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">👨‍💼 Staff (Admin)</p>
                <ul className="text-xs space-y-0.5">
                  <li>• First user to register</li>
                  <li>• Unlimited borrowing</li>
                  <li>• Manage books & users</li>
                  <li>• View all transactions</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">👨‍🏫 Teacher</p>
                <ul className="text-xs space-y-0.5">
                  <li>• Promoted by staff</li>
                  <li>• Borrow up to 5 books</li>
                  <li>• Read & return books</li>
                  <li>• View own history</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">👨‍🎓 Student</p>
                <ul className="text-xs space-y-0.5">
                  <li>• Default role</li>
                  <li>• Borrow up to 3 books</li>
                  <li>• Read & return books</li>
                  <li>• View own history</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              💡 Your role badge will appear next to your username in the header after login
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
