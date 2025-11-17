import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    sourcemap: true,
  },
  cacheDir: "node_modules/.vite",
  plugins: [    tailwindcss(),  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // <-- IMPORTANT
    },
  },
});
