import React, { createContext, useContext, useState } from "react";

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Agregar estado para el usuario

  // Función para iniciar sesión
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData); // Almacenar los datos del usuario (incluyendo el rol)
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null); // Limpiar los datos del usuario
  };

  // Valor que se proporciona a los componentes hijos
  const value = {
    isAuthenticated,
    user, // Incluir el usuario en el contexto
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