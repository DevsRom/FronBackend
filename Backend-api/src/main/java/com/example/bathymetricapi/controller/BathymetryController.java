package com.example.bathymetricapi.controller;

import com.example.bathymetricapi.service.BathymetricService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bathymetry")
@CrossOrigin(origins = "*")
public class BathymetryController {

    private final BathymetricService bathymetricService;

    public BathymetryController(BathymetricService bathymetricService) {
        this.bathymetricService = bathymetricService;
    }

    // ✅ **Subir y procesar archivo CSV**
    @PostMapping("/upload")
    public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file) {
        try {
            bathymetricService.processCsv(file);
            return ResponseEntity.ok("✅ Archivo CSV subido correctamente.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Error al procesar el archivo: " + e.getMessage());
        }
    }

    // ✅ **Obtener datos procesados**
    @GetMapping("/data")
    public ResponseEntity<List<Map<String, Double>>> getData() {
        return ResponseEntity.ok(bathymetricService.getProcessedData());
    }

    // ✅ **Limpiar datos procesados**
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearData() {
        bathymetricService.clearProcessedData();
        return ResponseEntity.ok("✅ Datos eliminados correctamente.");
    }
}
