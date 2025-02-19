const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, "data", "users.txt"); // Ruta correcta

app.use(cors());
app.use(express.json());

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization; // Asume que el token viene en el header
  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }
  // Aquí deberías validar el token (por ejemplo, con JWT)
  next();
};

// Middleware para verificar si el usuario es Super Usuario
const isSuperUser = (req, res, next) => {
  const token = req.headers.authorization;
  // Aquí deberías decodificar el token y obtener el rol del usuario
  const user = decodeToken(token); // Función ficticia para decodificar el token
  if (user.role !== "superuser") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};

// Leer usuarios desde el archivo con validación
const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, ""); // Crear el archivo si no existe
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return data
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error("Error al parsear línea:", line);
          return null;
        }
      })
      .filter((user) => user !== null); // Filtrar líneas corruptas
  } catch (error) {
    console.error("Error al leer usuarios:", error);
    return [];
  }
};

// Escribir usuarios en el archivo
const writeUsers = (users) => {
  const data = users.map((user) => JSON.stringify(user)).join("\n");
  fs.writeFileSync(USERS_FILE, data, "utf8");
};

// Ruta para obtener todos los usuarios (solo para superuser)
app.get("/api/users", isAuthenticated, isSuperUser, (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch (error) {
    console.error("Error al leer usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para autorizar/desautorizar usuarios (solo para superuser)
app.put("/api/users/authorize", isAuthenticated, isSuperUser, (req, res) => {
  const { email, authorized } = req.body;

  if (!email || authorized === undefined) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const users = readUsers();
    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    users[userIndex].authorized = authorized;
    writeUsers(users);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al autorizar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para asignar roles (solo para superuser)
app.put("/api/users/assign-role", isAuthenticated, isSuperUser, (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const users = readUsers();
    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    users[userIndex].role = role;
    writeUsers(users);
    res.json({ message: "Rol asignado correctamente" });
  } catch (error) {
    console.error("Error al asignar rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
