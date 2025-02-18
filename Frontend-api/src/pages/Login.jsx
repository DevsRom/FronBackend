import React, { useState, useContext } from "react";
import { API_URL } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Paper, CircularProgress, Snackbar, Alert, CssBaseline } from "@mui/material";
import "@fontsource/roboto";
import { AuthContext } from "../context/AuthContext";
import "../styles/background.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(form.email)) {
      setError("Por favor, introduce un email válido.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Credenciales incorrectas.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      login({ email: form.email });
      setOpenSnackbar(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-with-image">
      <div className="form-container">
        <Paper elevation={0} sx={{ padding: 3, textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "white" }}> {/* Borde y fondo blanco */}
          <Typography variant="h5" fontFamily="Roboto">Iniciar Sesión</Typography>
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
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Iniciar Sesión"}
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
          </Typography>
        </Paper>
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity="success">Inicio de sesión exitoso</Alert>
        </Snackbar>
      </div>
      <div className="image-container">
        <img src="/13557453.jpg" alt="Background" /> {/* Usar la nueva imagen */}
      </div>
    </div>
  );
};

export default Login;