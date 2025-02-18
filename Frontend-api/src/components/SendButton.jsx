import React from "react";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)({
  fontFamily: "Roboto, sans-serif",
  fontSize: "0.75rem", // Reducir tamaño de fuente
  padding: "6px 12px", // Ajustar padding para reducir tamaño
  textTransform: "none", // Evitar mayúsculas automáticas
  minWidth: "80px", // Tamaño mínimo para mantener consistencia
});

export default function SendButton({ onClick, disabled }) {
  return (
    <StyledButton
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      endIcon={<SendIcon fontSize="small" />}
    >
      Send
    </StyledButton>
  );
}