import { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function NewProject({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isNewProject, setIsNewProject] = useState(true);
  const [projectList, setProjectList] = useState([]);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  // 📌 **Obtener la lista de proyectos al cargar el componente**
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (!response.ok) throw new Error("Error al obtener proyectos");
        const data = await response.json();
        setProjectList(data.projects);
      } catch (error) {
        console.error("❌ Error obteniendo proyectos:", error);
      }
    };
    fetchProjects();
  }, [open]); // Se ejecuta cada vez que se abre el diálogo

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setConfirmOverwrite(false);
    setProjectName("");
    setSelectedProject("");
  };

  // 📌 **Verificar si el proyecto ya existe**
  const handleCreate = () => {
    if (isNewProject) {
      if (!projectName.trim()) return;
      if (projectList.includes(projectName)) {
        setConfirmOverwrite(true);
      } else {
        createProject(projectName);
      }
    } else if (selectedProject) {
      if (onCreate) onCreate(selectedProject);
      handleClose();
    }
  };

  // 📌 **Crear proyecto en el backend**
  const createProject = async (name) => {
    try {
      const response = await fetch(`${API_URL}/new_project?name=${encodeURIComponent(name)}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Error creando el proyecto: ${response.status}`);
      }

      if (onCreate) onCreate(name);
      handleClose();
    } catch (error) {
      console.error("❌ Error creando proyecto:", error);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ fontFamily: "Roboto", fontSize: "0.875rem", padding: "6px 12px" }}
      >
        Crear o Seleccionar Proyecto
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "Roboto", fontSize: "1rem" }}>Gestionar Proyecto</DialogTitle>
        <DialogContent sx={{ padding: 2 }}>
          <FormControl fullWidth size="small" sx={{ marginBottom: 2 }}>
            <InputLabel sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>Modo</InputLabel>
            <Select
              value={isNewProject ? "new" : "existing"}
              onChange={(e) => setIsNewProject(e.target.value === "new")}
              sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}
            >
              <MenuItem value="new">Crear Nuevo Proyecto</MenuItem>
              <MenuItem value="existing">Elegir de la Lista</MenuItem>
            </Select>
          </FormControl>

          {isNewProject ? (
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Proyecto"
              type="text"
              fullWidth
              variant="outlined"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              size="small"
              sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}
            />
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>Seleccionar Proyecto</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}
              >
                {Array.isArray(projectList) && projectList.length > 0 ? (
                  projectList.map((project, index) => (
                    <MenuItem key={index} value={project}>{project}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay proyectos disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>

        <DialogActions sx={{ padding: 2 }}>
          <Button onClick={handleClose} color="secondary" sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            color="primary"
            disabled={isNewProject ? !projectName.trim() : !selectedProject}
            sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📌 **Diálogo de Confirmación para Sobrescribir Proyecto** */}
      <Dialog open={confirmOverwrite} onClose={() => setConfirmOverwrite(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "Roboto", fontSize: "1rem" }}>Sobrescribir Proyecto</DialogTitle>
        <DialogContent sx={{ fontFamily: "Roboto", fontSize: "0.875rem", padding: 2 }}>
          <Typography>
            El proyecto <strong>{projectName}</strong> ya existe. ¿Deseas sobrescribirlo?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button onClick={() => setConfirmOverwrite(false)} color="secondary" sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              createProject(projectName);
              setConfirmOverwrite(false);
            }}
            color="error"
            sx={{ fontFamily: "Roboto", fontSize: "0.875rem" }}
          >
            Sobrescribir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default NewProject;
