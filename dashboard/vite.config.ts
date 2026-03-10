import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { rmSync, existsSync } from "node:fs";

// Custom plugin: clean only assets/ and index.html, leave sounds/ etc. intact
function cleanBuildPlugin() {
  return {
    name: "clean-build",
    buildStart() {
      const outDir = resolve(__dirname, "../server/public");
      const targets = ["assets", "index.html"];
      for (const t of targets) {
        const p = resolve(outDir, t);
        if (existsSync(p)) rmSync(p, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), cleanBuildPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true,
      },
    },
  },
  build: {
    outDir: "../server/public",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-socket": ["socket.io-client"],
        },
      },
    },
  },
});