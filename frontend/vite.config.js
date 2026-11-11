import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O proxy evita problemas de CORS: /api/clientes -> http://localhost:3000/clientes
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
