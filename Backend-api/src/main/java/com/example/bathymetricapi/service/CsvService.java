package com.example.bathymetricapi.service;

import com.example.bathymetricapi.model.BathymetricData;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvService {

    public List<BathymetricData> parseCsv(File file) {
        List<BathymetricData> dataList = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            boolean firstLine = true;
            String delimiter = detectDelimiter(file);

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false; // 📌 Omitir encabezados
                    continue;
                }

                String[] values = line.split(delimiter);
                if (values.length >= 3) {
                    try {
                        double latitude = parseDouble(values[0]);
                        double longitude = parseDouble(values[1]);
                        double depth = parseDepth(values[2]); // 📌 Asegurar profundidad negativa

                        if (isValidCoordinate(latitude, longitude)) {
                            dataList.add(new BathymetricData(latitude, longitude, depth));
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ Advertencia: No se pudo convertir la línea a números válidos: " + line);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("❌ Error al leer el archivo procesado: " + e.getMessage());
        }

        return dataList;
    }

    private String detectDelimiter(File file) {
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String firstLine = br.readLine();
            if (firstLine.contains(";"))
                return ";";
            if (firstLine.contains(","))
                return ",";
            if (firstLine.contains("\t"))
                return "\t";
        } catch (IOException e) {
            System.err.println("⚠️ No se pudo detectar el delimitador del CSV. Usando ',' por defecto.");
        }
        return ","; // 📌 Valor por defecto
    }

    private double parseDouble(String value) {
        return Double.parseDouble(value.trim().replace(",", "."));
    }

    private double parseDepth(String value) {
        double depth = parseDouble(value);
        // 📌 Si la profundidad es mayor a 0, convertir a negativo
        return (depth > 0) ? -depth : depth;
    }

    private boolean isValidCoordinate(double latitude, double longitude) {
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }
}
