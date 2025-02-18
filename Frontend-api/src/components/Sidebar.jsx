import React from "react";
import { Link } from "react-router-dom";
import "../styles/Components.css";

const Sidebar = () => {
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
        <li>
          <Link to="/dashboard/users">Usuarios</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;