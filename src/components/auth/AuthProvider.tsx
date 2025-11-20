import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/types";
import { api } from "@/db/api";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  client 
}: { 
  children: ReactNode; 
  client: SupabaseClient;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await api.getProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  };

  useEffect(() => {
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        api.getProfile(session.user.id).then(setProfile).catch(console.error);
      }
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        api.getProfile(session.user.id).then(setProfile).catch(console.error);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const signOut = async () => {
    await client.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
