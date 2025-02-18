import React from "react";
import { Typography, Paper, Container } from "@mui/material";

const MapView = () => {
  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vista del Mapa
        </Typography>
        <Typography variant="body1">
          Aquí puedes ver un mapa interactivo con los datos de tus proyectos.
        </Typography>
      </Paper>
    </Container>
  );
};

export default MapView;