import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Button, Select, MenuItem, CircularProgress, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener usuarios desde el backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener usuarios:", error);
        setError("Error al cargar usuarios");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <CircularProgress />; // Indicador de carga
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>; // Mostrar error
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Autorizado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onChange={(e) => handleAssignRole(user.email, e.target.value)}
                >
                  <MenuItem value="superuser">Super Usuario</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">Usuario</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.authorized}
                  onChange={(e) => handleAuthorization(user.email, e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Button variant="contained" color="primary">
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Users;