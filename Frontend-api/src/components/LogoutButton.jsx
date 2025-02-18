import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Importar el contexto

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Obtener la función de logout del contexto

  const handleLogout = () => {
    logout(); // Cerrar sesión (eliminar token y limpiar estado del usuario)
    navigate("/"); // Redirigir al usuario a la página de Login
  };

  return (
    <Button
      variant="text"
      onClick={handleLogout}
      sx={{
        position: "absolute",
        top: 20,
        right: 20,
        color: "#1976d2",
        fontFamily: "Roboto, sans-serif",
        fontSize: "0.75rem",
        textTransform: "lowercase",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        zIndex: 1301,
        "&:hover": {
          color: "#115293",
        },
        "&:active": {
          color: "#0d3c61",
        },
      }}
    >
      <LogoutIcon sx={{ fontSize: 18 }} />
      logout
    </Button>
  );
}

export default LogoutButton;