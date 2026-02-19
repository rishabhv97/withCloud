import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User as AppUser } from '../types'; 
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUser({
          id: data.id,
          name: data.name || email.split('@')[0],
          email: data.email || email,
          phone: data.phone || '',
          role: data.role as any,
          joinDate: data.created_at,
          isVerified: data.is_verified,
          status: 'Active',
          companyName: data.company_name
        });
      } else {
        setUser({
          id: userId,
          name: email.split('@')[0],
          email: email,
          phone: '',
          role: 'User' as any,
          joinDate: new Date().toISOString(),
          isVerified: false,
          status: 'Active'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {loading ? (
         <div className="flex items-center justify-center h-screen w-full bg-stone-50 text-brand-green font-bold text-xl animate-pulse">
           Loading Kiwi Sqft...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};