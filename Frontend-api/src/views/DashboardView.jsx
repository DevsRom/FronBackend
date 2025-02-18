import React from "react";
import { Typography, Paper, Container } from "@mui/material";

const DashboardView = () => {
  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resumen de Proyectos
        </Typography>
        <Typography variant="body1">
          Aquí puedes ver un resumen de todos los proyectos activos.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DashboardView;