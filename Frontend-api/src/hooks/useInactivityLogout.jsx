import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const useInactivityLogout = (timeout = 5 * 60 * 1000) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logout, timeout);
    };

    const logout = () => {
      localStorage.removeItem("token"); // Eliminar el token
      setUser(null); // Limpiar el estado del usuario
      navigate("/"); // Redirigir al Login
    };

    // Reiniciar el temporizador cuando el usuario interactúe con la página
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Iniciar el temporizador al montar el componente
    resetTimer();

    // Limpiar el temporizador y los event listeners al desmontar el componente
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [navigate, setUser, timeout]);
};

export default useInactivityLogout;