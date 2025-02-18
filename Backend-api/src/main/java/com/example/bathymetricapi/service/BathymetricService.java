package com.example.bathymetricapi.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BathymetricService {

    private final List<Map<String, Double>> processedData = new ArrayList<>();

    // ✅ **Procesar CSV**
    public void processCsv(MultipartFile file) throws Exception {
        processedData.clear(); // 🔹 **Limpia los datos anteriores antes de cargar nuevos**
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;

        // ✅ Detectar el separador
        String separator = detectSeparator(reader);

        while ((line = reader.readLine()) != null) {
            String[] values = line.split(separator);

            if (values.length < 3) {
                System.err.println("⚠️ Datos inválidos en la fila: " + line);
                continue; // Saltar filas inválidas
            }

            try {
                double latitude = Double.parseDouble(values[0].trim());
                double longitude = Double.parseDouble(values[1].trim());
                double depth = Double.parseDouble(values[2].trim());

                Map<String, Double> dataPoint = new HashMap<>();
                dataPoint.put("latitude", latitude);
                dataPoint.put("longitude", longitude);
                dataPoint.put("depth", depth);

                processedData.add(dataPoint);
            } catch (NumberFormatException e) {
                System.err.println("⚠️ Error al convertir datos: " + line);
            }
        }
    }

    // ✅ **Obtener datos procesados**
    public List<Map<String, Double>> getProcessedData() {
        return processedData;
    }

    // ✅ **Limpiar datos procesados**
    public void clearProcessedData() {
        processedData.clear();
        System.out.println("🗑️ Datos eliminados correctamente.");
    }

    // ✅ **Detectar automáticamente el separador**
    private String detectSeparator(BufferedReader reader) throws Exception {
        String firstLine = reader.readLine();
        if (firstLine.contains(";"))
            return ";";
        if (firstLine.contains(","))
            return ",";
        if (firstLine.contains("\t"))
            return "\t";
        return ","; // Default a coma
    }
}
