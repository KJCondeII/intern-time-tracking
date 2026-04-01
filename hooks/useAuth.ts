import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          // Check if user is new (created less than 5 minutes ago)
          const createdAt = new Date(data.session.user.created_at || "");
          const now = new Date();
          const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
          setIsNewUser(diffInMinutes < 5);
        } else {
          setIsAuthenticated(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Check if user is new
        const createdAt = new Date(session.user.created_at || "");
        const now = new Date();
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        setIsNewUser(diffInMinutes < 5);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsNewUser(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsNewUser(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { user, loading, isAuthenticated, logout, isNewUser };
}
