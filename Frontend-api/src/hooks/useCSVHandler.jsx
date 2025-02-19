import Papa from "papaparse";
import { useState, useCallback } from "react";
import axios from "axios";

// URL del Backend
const API_URL = "http://localhost:8000/api";

export function useCSVHandler() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({
    latitude: "",
    longitude: "",
    depth: "",
  });
  const [progress, setProgress] = useState(0);

  const detectSeparator = useCallback((sampleText) => {
    if (sampleText.includes(";")) return ";";
    if (sampleText.includes(",")) return ",";
    if (sampleText.includes("\t")) return "\t";
    return ",";
  }, []);

  const parseCSV = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const separator = detectSeparator(text);

      console.log("📂 Procesando archivo CSV con separador:", separator);

      Papa.parse(text, {
        delimiter: separator,
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          console.log("✅ CSV procesado correctamente:", result.data.slice(0, 5));
          if (result.data.length > 0) {
            let detectedHeaders = Object.keys(result.data[0]);

            console.log("🔍 Columnas detectadas en el CSV original:", detectedHeaders);

            let correctedHeaders = detectedHeaders.reduce((acc, header) => {
              let normalized = header.trim().toLowerCase();
              if (normalized.includes("lat")) acc.latitude = header;
              if (normalized.includes("lon")) acc.longitude = header;
              if (normalized.includes("depth") || normalized.includes("profundidad")) acc.depth = header;
              return acc;
            }, { latitude: "", longitude: "", depth: "" });

            console.log("🔄 Columnas normalizadas antes de procesar:", correctedHeaders);

            setHeaders(detectedHeaders);
            setData(result.data);
            setSelectedColumns(correctedHeaders);
          } else {
            console.error("❌ El archivo CSV no contiene encabezados válidos.");
          }
        },
        error: (error) => {
          console.error("❌ Error al parsear el archivo CSV:", error);
        },
      });
    };
    reader.readAsText(file);
  }, [detectSeparator]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    parseCSV(file);
  }, [parseCSV]);

  const handleColumnSelection = useCallback((column, value) => {
    setSelectedColumns((prev) => ({ ...prev, [column]: value }));
  }, []);

  const handleUpload = useCallback(async (projectName) => {
    if (!selectedFile) {
      console.error("❌ No se ha seleccionado ningún archivo.");
      return;
    }

    if (!selectedColumns.latitude || !selectedColumns.longitude || !selectedColumns.depth) {
      console.error("❌ No se han seleccionado correctamente las columnas.");
      return;
    }

    console.log("📋 Columnas seleccionadas por el usuario:", selectedColumns);

    // Validar que los valores de latitud y longitud sean números válidos
    const validData = data.filter(row => {
      const lat = parseFloat(row[selectedColumns.latitude]);
      const lon = parseFloat(row[selectedColumns.longitude]);
      return !isNaN(lat) && !isNaN(lon); // Filtrar filas con valores no numéricos
    });

    if (validData.length === 0) {
      console.error("❌ No se encontraron datos válidos en el archivo CSV.");
      return;
    }

    const csvContent = ["latitude,longitude,depth"]
      .concat(validData.map(row => `${row[selectedColumns.latitude]},${row[selectedColumns.longitude]},${row[selectedColumns.depth]}`))
      .join("\n");

    console.log("📤 CSV generado antes de enviar al backend:\n", csvContent);

    const blob = new Blob([csvContent], { type: "text/csv" });
    const processedFile = new File([blob], "processed_data.csv", { type: "text/csv" });

    const formData = new FormData();
    formData.append("file", processedFile);

    try {
      const token = localStorage.getItem("token"); // Obtener el token del localStorage

      if (!token) {
        throw new Error("No se encontró el token de autenticación.");
      }

      const uploadUrl = `${API_URL}/bathymetry/upload/${projectName}`;
      console.log(`📡 Enviando archivo a: ${uploadUrl}`);

      // Simular progreso si el backend no lo proporciona
      const totalSteps = 100;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30)); // Simular un retraso
        setProgress((i / totalSteps) * 100); // Actualizar el progreso
      }

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
        },
      });

      console.log("✅ Archivo enviado correctamente:", response.data);
    } catch (error) {
      console.error("❌ Error al enviar el archivo:", error);

      if (error.response && error.response.status === 401) {
        // Si el error es 401 (No autorizado), redirigir al usuario a la página de inicio de sesión
        localStorage.removeItem("token"); // Eliminar el token inválido
        window.location.href = "/login"; // Redirigir al login
      }

      setProgress(0); // Reiniciar el progreso en caso de error
    }
  }, [selectedFile, selectedColumns, data]);

  return {
    selectedFile,
    data,
    headers,
    selectedColumns,
    progress,
    handleFileSelect,
    handleColumnSelection,
    handleUpload,
  };
}