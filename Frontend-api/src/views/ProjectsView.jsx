import React, { useState } from "react";
import { Typography, Button, Container, Paper, TextField, List, ListItem, ListItemText } from "@mui/material";

const ProjectsView = () => {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  const handleCreateProject = () => {
    if (projectName.trim() !== "") {
      setProjects([...projects, projectName]);
      setProjectName("");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gestión de Proyectos
      </Typography>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <TextField
          fullWidth
          label="Nombre del Proyecto"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleCreateProject}>
          Crear Proyecto
        </Button>
      </Paper>
      <Typography variant="h6" sx={{ mt: 4 }}>
        Proyectos Existentes:
      </Typography>
      {projects.length > 0 ? (
        <List>
          {projects.map((project, index) => (
            <ListItem key={index}>
              <ListItemText primary={project} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No hay proyectos creados aún.</Typography>
      )}
    </Container>
  );
};

export default ProjectsView;