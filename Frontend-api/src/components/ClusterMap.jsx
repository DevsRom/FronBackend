import React, { useMemo, useState, useCallback } from "react";
import { Layer, Source } from "react-map-gl";
import Supercluster from "supercluster";
import { Marker } from "react-map-gl";

const ClusterMap = ({ data, zoom, bounds }) => {
  const [clusters, setClusters] = useState([]);

  // Crear una instancia de Supercluster
  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 40, // Radio para agrupar puntos
      maxZoom: 16, // Zoom máximo para agrupar
    });

    // Cargar los datos en Supercluster
    sc.load(data.map(point => ({
      type: "Feature",
      properties: { ...point },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    })));

    return sc;
  }, [data]);

  // Calcular los clusters cuando cambia el zoom o los límites del mapa
  useMemo(() => {
    if (bounds && zoom !== undefined) {
      const newClusters = supercluster.getClusters(bounds, Math.floor(zoom));
      setClusters(newClusters);
    }
  }, [bounds, zoom, supercluster]);

  // Renderizar los clusters o puntos individuales
  return (
    <>
      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = cluster.properties;

        if (isCluster) {
          // Renderizar un cluster
          return (
            <Marker key={`cluster-${cluster.id}`} longitude={longitude} latitude={latitude}>
              <div
                style={{
                  width: `${10 + (pointCount / data.length) * 20}px`,
                  height: `${10 + (pointCount / data.length) * 20}px`,
                  borderRadius: "50%",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => {
                  // Ampliar el zoom al hacer clic en un cluster
                  const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20);
                  setZoom(expansionZoom);
                }}
              >
                {pointCount}
              </div>
            </Marker>
          );
        } else {
          // Renderizar un punto individual
          return (
            <Marker key={`point-${cluster.properties.id}`} longitude={longitude} latitude={latitude}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ff5722",
                  cursor: "pointer",
                }}
              />
            </Marker>
          );
        }
      })}
    </>
  );
};

export default ClusterMap;