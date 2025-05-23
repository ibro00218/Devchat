// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: ".", // You're already in client/, so "." is correct
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ FIXED: no "client" prefix
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/public"), // ✅ Output to root-level dist/public
    emptyOutDir: true,
  },
});
