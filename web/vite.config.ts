import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  cacheDir: path.resolve(__dirname, ".vite-cache"),
  server: { host: "0.0.0.0", port: 3000 }
});
