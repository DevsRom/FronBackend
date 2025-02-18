import { useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";

// 🔑 Token de Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiaWRhdGFpIiwiYSI6ImNtNjVlMjF5MDF1bGEyanEzaG1pNWUzaWcifQ.uYLrPuBFFF6YLHiOU_4zXQ";

const MapboxMap = ({ mapData }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const superclusterRef = useRef(null);

  // Crear una instancia de Supercluster
  superclusterRef.current = useMemo(() => {
    const sc = new Supercluster({
      radius: 40, // Radio para agrupar puntos
      maxZoom: 16, // Zoom máximo para agrupar
    });

    // Cargar los datos en Supercluster
    if (mapData && Array.isArray(mapData)) {
      const points = mapData
        .filter(({ latitude, longitude, depth }) => 
          !isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
        )
        .map(({ latitude, longitude, depth }) => ({
          type: "Feature",
          properties: { depth: parseFloat(depth) },
          geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        }));

      sc.load(points);
    }

    return sc;
  }, [mapData]);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log("🗺️ Inicializando el mapa con vista global...");

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [0, 20],
      zoom: 1.5,
    });

    map.current.on("load", () => {
      console.log("🗺️ Mapa cargado correctamente.");

      // Agregar la fuente y capa para clusters
      map.current.addSource("clusters", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true, // Habilitar clustering
        clusterMaxZoom: 14, // Zoom máximo para clustering
        clusterRadius: 50, // Radio para agrupar puntos
      });

      // Capa para clusters
      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "clusters",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6", // Color para clusters pequeños
            100,
            "#f1f075", // Color para clusters medianos
            750,
            "#f28cb1", // Color para clusters grandes
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20, // Tamaño para clusters pequeños
            100,
            30, // Tamaño para clusters medianos
            750,
            40, // Tamaño para clusters grandes
          ],
        },
      });

      // Capa para el número de puntos en los clusters
      map.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "clusters",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      // Capa para puntos individuales
      map.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "clusters",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#ff0000",
          "circle-radius": 5,
          "circle-opacity": 0.8,
        },
      });

      console.log("🆕 Fuente y capas de clusters agregadas correctamente.");
    });

    // Manejar clics en clusters
    map.current.on("click", "clusters", (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });

      const clusterId = features[0].properties.cluster_id;
      const source = map.current.getSource("clusters");

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.current.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
    });

    // Cambiar el cursor al hacer hover sobre clusters
    map.current.on("mouseenter", "clusters", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "clusters", () => {
      map.current.getCanvas().style.cursor = "";
    });

    return () => map.current.remove();
  }, []);

  useEffect(() => {
    if (!map.current || !mapData || !Array.isArray(mapData)) {
      console.warn("⚠️ No hay datos válidos para mostrar en el mapa.");
      return;
    }

    console.log("✅ Datos recibidos en MapboxMap.jsx:", mapData);

    // Actualizar la fuente de datos del mapa
    const source = map.current.getSource("clusters");
    if (source) {
      console.log("🔄 Actualizando fuente 'clusters' en el mapa...");
      source.setData({
        type: "FeatureCollection",
        features: superclusterRef.current.getClusters([-180, -90, 180, 90], Math.floor(map.current.getZoom())),
      });
    }

    // Ajustar el zoom a los datos
    const bounds = new mapboxgl.LngLatBounds();
    mapData.forEach(({ latitude, longitude }) => {
      bounds.extend([parseFloat(longitude), parseFloat(latitude)]);
    });

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    } else {
      console.warn("⚠️ No se pueden ajustar los límites porque no hay puntos.");
    }
  }, [mapData]);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default MapboxMap;