import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface RequireAuthProps {
  children: ReactNode;
  whiteList?: string[];
}

export function RequireAuth({ children, whiteList = [] }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isWhitelisted = whiteList.some(pattern => {
    if (pattern.endsWith("/*")) {
      const basePath = pattern.slice(0, -2);
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === pattern;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user && !isWhitelisted) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
