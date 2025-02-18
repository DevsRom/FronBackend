package com.example.bathymetricapi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * Modelo de punto de datos geoespaciales con profundidad.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PointData implements Serializable {
    private double latitude;
    private double longitude;
    private double depth;
}
