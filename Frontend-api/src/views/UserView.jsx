import React from "react";
import { Typography, Paper, Container } from "@mui/material";

const UsersView = () => {
  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1">
          Aquí puedes gestionar los usuarios del sistema.
        </Typography>
      </Paper>
    </Container>
  );
};

export default UsersView;