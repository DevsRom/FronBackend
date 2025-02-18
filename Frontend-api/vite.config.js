import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: "localhost", // Asegúrate de que el servidor escuche en localhost
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000", // O usa "http://backend_service:8000" si está en Docker
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:8000/api"
    ),
  },
  plugins: [react()],
});
