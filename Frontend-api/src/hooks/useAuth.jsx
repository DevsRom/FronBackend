import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://172.18.0.2:8000/api";

export function useAuth() {
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del usuario.");
        }

        const data = await response.json();
        if (data.user) {
          setUser(data.user); // Actualizar el estado del usuario
        } else {
          localStorage.removeItem("token"); // Eliminar el token si no hay usuario
          setUser(null); // Limpiar el estado del usuario
        }
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
        localStorage.removeItem("token"); // Eliminar el token en caso de error
        setUser(null); // Limpiar el estado del usuario
      }
    } else {
      setUser(null); // Limpiar el estado del usuario si no hay token
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    localStorage.removeItem("token"); // Eliminar el token
    setUser(null); // Limpiar el estado del usuario
  };

  return { user, setUser, logout }; // Retornar la función de logout
}