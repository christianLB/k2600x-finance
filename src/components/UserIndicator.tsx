"use client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@k2600x/design-system";

export default function UserIndicator() {
  const { 
    user, 
    loading, 
    error,
    logout,
    initialized 
  } = useAuth();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Mostrar notificación de error si hay un error de autenticación
  useEffect(() => {
    if (error && !isLoginPage) {
      console.error('Error de autenticación:', error);
      // Aquí podrías agregar un toast o notificación de error si lo deseas
    }
  }, [error, isLoginPage]);

  // Si estamos en la página de login o la autenticación no se ha inicializado, no mostrar nada
  if (isLoginPage || (!initialized && !user)) {
    return null;
  }

  // Mostrar skeleton loader mientras se verifica la autenticación
  if (loading || !initialized) {
    return (
      <div className="flex items-center space-x-2 p-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // Si no hay usuario autenticado después de la inicialización, redirigir al login
  if (!user) {
    // La redirección se manejará en el middleware o en el layout
    return null;
  }

  // Usuario autenticado - mostrar indicador de usuario
  return (
    <div className="relative flex items-center">
      <Button 
        variant="ghost" 
        className="flex items-center space-x-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <User className="h-4 w-4" />
        <span className="max-w-[120px] truncate">
          {user.username || user.email}
        </span>
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border z-50">
          <div className="py-1">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {user.username || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <div className="border-t border-border"></div>
            <button
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted flex items-center"
              onClick={() => {
                console.log('Cerrando sesión...');
                logout();
              }}
              disabled={loading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </button>
          </div>
        </div>
      )}

      {/* Cerrar el menú al hacer clic fuera */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
