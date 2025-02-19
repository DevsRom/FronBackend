import { useState } from "react";
import FileUploader from "../components/FileUploader";
import ColumnSelector from "../components/ColumnSelector";
import NewProject from "../components/NewProject";
import SendButton from "../components/SendButton";
import MapboxMap from "../components/MapboxMap";
import Source3D from "../components/Source3D";
import ProgressBar from "../components/ProgressBar";
import { useCSVHandler } from "../hooks/useCSVHandler";
import { Container, Typography, Paper, Snackbar, Alert, Grid, Box, AppBar, Toolbar, IconButton, Switch } from "@mui/material";
import LogoutButton from "../components/LogoutButton";
import useInactivityLogout from "../hooks/useInactivityLogout";
import Sidebar from "../components/Sidebar";
import MenuIcon from "@mui/icons-material/Menu"; // Ícono para el botón del menú

function Dashboard({ user, setUser }) {
  const [projectName, setProjectName] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [is3DView, setIs3DView] = useState(false); // Estado para controlar la vista (Mapa o Modelo 3D)
  const [is3DModelGenerated, setIs3DModelGenerated] = useState(false); // Estado para controlar si el modelo 3D está generado
  const [modelPath, setModelPath] = useState(null); // Estado para almacenar la ruta del modelo 3D

  const {
    handleFileSelect,
    data,
    headers,
    selectedColumns,
    handleColumnSelection,
    handleUpload,
    progress,
    selectedFile,
  } = useCSVHandler();

  useInactivityLogout();

  const handleProjectCreate = (name) => {
    setProjectName(name);
    setSnackbarMessage(`Proyecto seleccionado: ${name}`);
    setOpenSnackbar(true);
  };

  const handleSend = () => {
    if (!projectName) {
      setSnackbarMessage("❌ No se ha seleccionado un proyecto.");
      setOpenSnackbar(true);
      return;
    }
    handleUpload(projectName);
    setSnackbarMessage("📤 Datos enviados con éxito.");
    setOpenSnackbar(true);
  };

  // Función para cambiar entre mapa y modelo 3D
  const handleViewChange = (event) => {
    const is3DEnabled = event.target.checked;
    setIs3DView(is3DEnabled);

    if (is3DEnabled && !is3DModelGenerated) {
      // Generar el modelo 3D automáticamente al activar el switch
      generate3DModel();
    }
  };

  // Función para generar el modelo 3D
  const generate3DModel = async () => {
    if (!projectName) {
      setSnackbarMessage("❌ No se ha seleccionado un proyecto.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Obtén el token del almacenamiento local

      if (!token) {
        throw new Error("No se encontró el token de autenticación.");
      }

      // Llamada al backend para generar el modelo 3D
      const response = await fetch(`http://127.0.0.1:8000/api/bathymetry/model/${projectName}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // Envía el token en el encabezado
        },
      });

      if (!response.ok) {
        throw new Error("Error al generar el modelo 3D");
      }

      const data = await response.json();
      const generatedModelPath = `http://127.0.0.1:8000${data.file_url}`; // URL completa del modelo 3D
      setModelPath(generatedModelPath);

      setIs3DModelGenerated(true);
      setSnackbarMessage("🏗️ Modelo 3D generado con éxito.");
    } catch (error) {
      console.error("❌ Error al generar el modelo 3D:", error);
      setSnackbarMessage("❌ Error al generar el modelo 3D.");
    } finally {
      setOpenSnackbar(true);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Menú Lateral */}
      <Sidebar />

      {/* Contenido Principal */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Barra Superior */}
        <AppBar position="static" sx={{ backgroundColor: "white", color: "black", boxShadow: "none" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: "Roboto", fontSize: "0.875rem" }}>
              📂 Subida y Visualización de Datos CSV
            </Typography>
            <LogoutButton setUser={setUser} />
          </Toolbar>
        </AppBar>

        {/* Sección Superior: Gestión de Proyectos y CSV */}
        <Container sx={{ marginTop: 4 }}>
          <Grid container spacing={2}>
            {/* Crear o Seleccionar Proyecto */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ padding: 2, border: "1px solid #e0e0e0", borderRadius: 2, fontFamily: "Roboto", fontSize: "0.875rem" }}>
                <NewProject onCreate={handleProjectCreate} />
              </Paper>
            </Grid>

            {/* FileUploader, ColumnSelector y SendButton en una misma fila */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ padding: 2, border: "1px solid #e0e0e0", borderRadius: 2, fontFamily: "Roboto", fontSize: "0.875rem" }}>
                <Grid container spacing={2} alignItems="center">
                  {/* FileUploader */}
                  <Grid item xs={12} sm={5}>
                    <FileUploader onFileSelect={handleFileSelect} />
                  </Grid>

                  {/* ColumnSelector */}
                  {headers.length > 0 && (
                    <Grid item xs={12} sm={5}>
                      <ColumnSelector
                        headers={headers}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={handleColumnSelection}
                      />
                    </Grid>
                  )}

                  {/* SendButton */}
                  <Grid item xs={12} sm={2}>
                    <SendButton
                      onClick={handleSend}
                      disabled={
                        !selectedFile ||
                        !selectedColumns.latitude ||
                        !selectedColumns.longitude ||
                        !selectedColumns.depth
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Barra de Progreso con valor en % */}
            <Grid item xs={12}>
              <Box sx={{ padding: 1 }}>
                <ProgressBar progress={progress} />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Sección Inferior: Mapa o Modelo 3D */}
        <Container sx={{ marginTop: 4, marginBottom: 4 }}>
          {/* Botón para alternar entre mapa y modelo 3D */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, marginBottom: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>
              {is3DView ? "Modelo 3D" : "Mapa"}
            </Typography>
            <Switch
              checked={is3DView}
              onChange={handleViewChange}
              color="primary"
              inputProps={{ "aria-label": "Alternar entre Mapa y Modelo 3D" }}
            />
          </Box>

          {/* Contenedor para Mapa o Modelo 3D */}
          <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, fontFamily: "Roboto", fontSize: "0.875rem" }}>
            {is3DView ? (
              is3DModelGenerated && <Source3D modelPath={modelPath} style={{ height: "500px", width: "100%" }} />
            ) : (
              <MapboxMap mapData={data} style={{ height: "500px", width: "100%" }} />
            )}
          </Paper>
        </Container>
      </Box>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="info">{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
}

export default Dashboard;