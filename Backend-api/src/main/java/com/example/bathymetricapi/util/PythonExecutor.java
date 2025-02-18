package com.example.bathymetricapi.util;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

public class PythonExecutor {
    private static final Logger LOGGER = Logger.getLogger(PythonExecutor.class.getName());
    private static final String PYTHON_SCRIPT_PATH = "src/main/resources/python/process_csv.py";
    private static final String OUTPUT_DIRECTORY = "uploads/";

    /**
     * Ejecuta un script de Python para procesar un archivo CSV.
     *
     * @param inputCsv Archivo CSV a procesar.
     * @return Archivo procesado por el script Python.
     */
    public File run(File inputCsv) {
        try {
            // Verificar si el script Python existe
            Path scriptPath = Paths.get(PYTHON_SCRIPT_PATH);
            if (!Files.exists(scriptPath)) {
                LOGGER.severe("❌ El script de Python no se encontró en: " + PYTHON_SCRIPT_PATH);
                throw new FileNotFoundException("El script de Python no existe en: " + PYTHON_SCRIPT_PATH);
            }

            // Crear directorio de salida si no existe
            Path outputDir = Paths.get(OUTPUT_DIRECTORY);
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }

            // Nombre del archivo de salida
            String outputFilePath = OUTPUT_DIRECTORY + "processed_" + inputCsv.getName();

            // Construcción del proceso de Python
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python3", PYTHON_SCRIPT_PATH, inputCsv.getAbsolutePath(), outputFilePath);
            processBuilder.redirectErrorStream(true);

            LOGGER.info("📌 Ejecutando Python: " + PYTHON_SCRIPT_PATH);
            LOGGER.info("📌 Archivo de entrada: " + inputCsv.getAbsolutePath());
            LOGGER.info("📌 Archivo de salida esperado: " + outputFilePath);

            Process process = processBuilder.start();

            // Capturar la salida del script
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    LOGGER.info("🐍 Python output: " + line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                LOGGER.severe("❌ Error ejecutando Python. Código de salida: " + exitCode);
                return inputCsv;
            }

            // Verificar si el archivo de salida fue generado
            File processedFile = new File(outputFilePath);
            if (processedFile.exists() && processedFile.length() > 0) {
                return processedFile;
            } else {
                LOGGER.warning("⚠️ El archivo procesado no se generó correctamente.");
                return inputCsv;
            }

        } catch (IOException | InterruptedException e) {
            LOGGER.severe("❌ Error ejecutando script de Python: " + e.getMessage());
            return inputCsv;
        }
    }
}
