import React from "react";
import ReactDOM from "react-dom/client"; // Usar ReactDOM.createRoot en lugar de ReactDOM.render
import App from "./App";

// Crear un root y renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);