import React, { useState } from "react";
import { API_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Container, Typography, Paper, CircularProgress, Snackbar, Alert, CssBaseline } from "@mui/material";
import "@fontsource/roboto";
import { useAuth } from "../hooks/useAuth";
import "../styles/background.css";

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "No se pudo registrar el usuario.");
      }

      const data = await response.json();
      setOpenSnackbar(true);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-with-image">
      <div className="form-container">
        <Paper elevation={0} sx={{ padding: 3, textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "white" }}>
          <Typography variant="h5" fontFamily="Roboto">Registro</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Reingresar Contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Registrarse"}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </Typography>
        </Paper>
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity="success">Registro exitoso</Alert>
        </Snackbar>
      </div>
      <div className="image-container">
        <img src="/13557453.jpg" alt="Background" />
      </div>
    </div>
  );
};

export default Register;