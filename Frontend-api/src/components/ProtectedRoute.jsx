import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importar useAuth

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Usar useAuth para obtener el estado de autenticación

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // Redirigir si no está autenticado
  }

  return children; // Renderizar el componente protegido
};

export default ProtectedRoute;