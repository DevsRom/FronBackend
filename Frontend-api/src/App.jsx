import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider } from "./context/AuthContext";
import DashboardView from "./views/DashboardView";
import MapView from "./views/MapView";
import ProjectsView from "./views/ProjectsView";
import UsersView from "./views/UserView"; // Asegúrate de que el nombre del archivo coincida

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta pública: Página de inicio de sesión */}
        <Route path="/" element={<Login />} />

        {/* Ruta pública: Página de registro */}
        <Route path="/register" element={<Register />} />

        {/* Ruta protegida: Dashboard y sus vistas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        >
          {/* Subrutas del Dashboard */}
          <Route index element={<DashboardView />} />
          <Route path="map" element={<MapView />} />
          <Route path="projects" element={<ProjectsView />} />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="superuser"> {/* Solo el Super Usuario puede acceder */}
                <UsersView />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Ruta por defecto: Redirigir a / si no se encuentra la ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;