import { Box, Typography, Alert } from "@mui/material";

function Source3D({ modelPath, error }) {
  return (
    <Box sx={{ marginTop: 2, textAlign: "center" }}>
      {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}

      {modelPath && !error && (
        <Box sx={{ marginTop: 2, border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>🌍 Modelo 3D</Typography>
          <iframe
            src={modelPath}
            width="100%"
            height="500px"
            title="Modelo 3D"
            style={{ border: "none", borderRadius: "10px" }}
          />
        </Box>
      )}
    </Box>
  );
}

export default Source3D;