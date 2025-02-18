import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const ChartComponent = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/bathymetry/data`)
      .then((response) => response.json())
      .then((data) => {
        const labels = data.map((point) => `(${point.latitude}, ${point.longitude})`);
        const depths = data.map((point) => point.depth);

        setChartData({
          labels,
          datasets: [
            {
              label: "Profundidad (m)",
              data: depths,
              borderColor: "blue",
              fill: false,
            },
          ],
        });
      });
  }, []);

  return chartData ? <Line data={chartData} /> : <p>📊 Cargando datos...</p>;
};

export default ChartComponent;
