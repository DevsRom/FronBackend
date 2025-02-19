import React from "react";
import { Typography, Paper, Container } from "@mui/material";
import UserManagement from "../components/UserManagement";

const UsersView = ({ user }) => {
  if (!user || user.email !== "rodrigoyarzun.m@gmail.com") {
    return (
      <Container>
        <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
          <Typography variant="h4" gutterBottom color="error">
            Acceso denegado
          </Typography>
          <Typography variant="body1">
            Solo el administrador puede gestionar usuarios.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1">
          Aquí puedes gestionar los usuarios del sistema.
        </Typography>
        <UserManagement />
      </Paper>
    </Container>
  );
};

export default UsersView;
