import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importar useAuth

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth(); // Obtener el estado de autenticación y el usuario

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir al dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children; // Renderizar el componente protegido
};

export default ProtectedRoute;