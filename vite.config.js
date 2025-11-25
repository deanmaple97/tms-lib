import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env files based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Use VITE_BASE_URL from env — falls back to "/"
    base: env.VITE_BASE_URL,
  };
});