import React, { createContext, useContext, useState } from "react";

// Crear el contexto de autenticación
export const AuthContext = createContext(); // Exportar AuthContext

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para iniciar sesión
  const login = () => {
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false);
  };

  // Valor que se proporciona a los componentes hijos
  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};