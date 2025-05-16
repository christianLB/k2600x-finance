import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: number;
  username: string;
  email: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clave para almacenar el estado de autenticación en localStorage
const AUTH_STORAGE_KEY = 'auth_state';

// Función para obtener el estado inicial desde localStorage
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      loading: true,
      error: null,
      initialized: false,
    };
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      user: null,
      loading: true,
      error: null,
      initialized: false,
    };
  } catch (error) {
    console.error('Failed to parse auth state from localStorage', error);
    return {
      user: null,
      loading: true,
      error: 'Error al cargar la sesión',
      initialized: false,
    };
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);
  const router = useRouter();

  // Función para actualizar el estado
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Función para verificar la autenticación
  const checkAuth = useCallback(async () => {
    // No marcar como loading si ya está inicializado
    if (!state.initialized) {
      updateState({ loading: true });
    }
    
    try {
      const res = await fetch("/api/me", {
        credentials: 'include', // Asegurar que se envíen las cookies
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        updateState({
          user: data.user,
          loading: false,
          error: null,
          initialized: true,
        });
      } else {
        updateState({
          user: null,
          loading: false,
          error: 'Sesión expirada',
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      updateState({
        user: null,
        loading: false,
        error: 'Error de conexión',
        initialized: true,
      });
    }
  }, [state.initialized, updateState]);

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
    // Configurar un intervalo para verificar la autenticación periódicamente
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [checkAuth]);

  // Actualizar localStorage cuando cambie el estado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save auth state to localStorage', error);
      }
    }
  }, [state]);

  const login = useCallback((user: User) => {
    updateState({
      user,
      error: null,
      loading: false,
      initialized: true,
    });
  }, [updateState]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { 
        method: "POST",
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      updateState({
        user: null,
        loading: false,
        error: null,
        initialized: true,
      });
      router.push("/login");
    }
  }, [router, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Valor del contexto
  const value = React.useMemo(() => ({
    ...state,
    login,
    logout,
    checkAuth,
    clearError,
  }), [state, login, logout, checkAuth, clearError]);

  return (
    <AuthContext.Provider value={value}>
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
