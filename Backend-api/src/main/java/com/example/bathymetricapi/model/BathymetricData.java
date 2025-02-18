package com.example.bathymetricapi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * Modelo de datos batimétricos con latitud, longitud y profundidad.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BathymetricData implements Serializable {
    private double latitude;
    private double longitude;
    private double depth;
}
