import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("📡 Consultando datos desde:", `${API_URL}/bathymetry/data`);
    fetch(`${API_URL}/bathymetry/data`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener datos: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("✅ Datos recibidos:", data);
        setData(data);
      })
      .catch(error => {
        console.error("❌ Error al obtener datos del backend:", error);
        setError(error.message);
      });
  }, []);

  return (
    <div className="app-container">
      <h1>📊 Datos Batimétricos</h1>
      {error ? <p style={{ color: "red" }}>❌ {error}</p> : null}

      {data.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Profundidad</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>🔄 Cargando datos...</p>
      )}
    </div>
  );
}

export default App;

