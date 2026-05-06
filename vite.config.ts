import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev mode, /api/* routes don't run locally (they're Vercel Edge Functions).
// Forward them to the deployed Vercel URL so local development gets AI.
const VERCEL_URL = "https://weatherwear-v2.vercel.app";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: VERCEL_URL,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
