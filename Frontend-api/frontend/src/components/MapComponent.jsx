import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const MapComponent = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/bathymetry/data`)
      .then((response) => response.json())
      .then((data) => setPoints(data));
  }, []);

  return (
    <MapContainer center={[-33.4569, -70.6483]} zoom={6} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((point, index) => (
        <Marker key={index} position={[parseFloat(point[0]), parseFloat(point[1])]}>
          <Popup>Profundidad: {point[2]}m</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
