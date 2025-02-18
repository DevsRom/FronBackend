import { createTheme } from "@mui/material/styles";

// 📌 Tokens de diseño personalizados
export function getDesignTokens(mode) {
  return {
    palette: {
      mode,
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#9c27b0",
      },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary: mode === "light" ? "#000000" : "#ffffff",
      },
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
      button: {
        textTransform: "none",
        fontWeight: "bold",
      },
    },
  };
}

// 📌 Personalización de entradas (inputs)
export const inputsCustomizations = {
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
          "& fieldset": {
            borderColor: "#ddd",
          },
          "&:hover fieldset": {
            borderColor: "#aaa",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1976d2",
          },
        },
      },
    },
  },
};

// 📌 Crear el tema base
export const THEME = (mode) =>
  createTheme({
    ...getDesignTokens(mode),
    components: {
      ...inputsCustomizations,
    },
  });
