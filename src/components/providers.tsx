"use client";
import { ReactNode, useEffect, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Simplified auth context for demo
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // In a real app, this would come from NextAuth or similar
  useEffect(() => {
    // Check for existing user session (from localStorage or cookie)
    const storedUser = localStorage.getItem('gaply_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = (userData: { id: string; name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('gaply_user', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('gaply_user');
  };

  const value = {
    user,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  // For now, just render children since we're not actually using React Context in this simplified version
  // In a full implementation, we would use React.createContext and useContext
  return children;
}