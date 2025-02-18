import React from "react";
import { LinearProgress, Typography, Box } from "@mui/material";

const ProgressBar = ({ progress }) => {
  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 2 }}>
      {/* Barra de progreso */}
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6, // Grosor de la barra
            borderRadius: 2, // Bordes redondeados
            backgroundColor: "#e0e0e0", // Color de fondo de la barra
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#1976d2", // Color azul similar al botón Send
              borderRadius: 2, // Bordes redondeados
            },
          }}
        />
      </Box>

      {/* Porcentaje de avance (solo texto) */}
      <Typography variant="body2" sx={{ fontFamily: "Roboto", fontSize: "0.6rem", minWidth: "40px", textAlign: "right" }}>
        {Math.round(progress)}%
      </Typography>
    </Box>
  );
};

export default ProgressBar;