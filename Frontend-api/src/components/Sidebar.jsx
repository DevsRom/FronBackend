import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importar useAuth
import "../styles/Components.css";

const Sidebar = () => {
  const { user } = useAuth(); // Obtener el usuario autenticado

  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/dashboard/map">Mapa</Link>
        </li>
        <li>
          <Link to="/dashboard/projects">Proyectos</Link>
        </li>
        {/* Mostrar "Usuarios" solo si el usuario es Super Usuario */}
        {user?.role === "superuser" && (
          <li>
            <Link to="/dashboard/users">Usuarios</Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;