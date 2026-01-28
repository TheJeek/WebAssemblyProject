import {defineConfig} from 'vite'
import tailwindcss from '@tailwindcss/vite'
import * as path from "node:path";
import dotenv from "dotenv";

// Load environment variables based on NODE_ENV or default to development
const envFile = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : ".env.development";
dotenv.config({path: envFile});

// Fallback to .env if specific env file doesn't exist
dotenv.config({path: ".env"});

console.log("Loading environment from:", envFile);
console.log("VITE_API_URL:", process.env.VITE_API_URL);
console.log("VITE_APP_ENV:", process.env.VITE_APP_ENV);

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
    define: {
        "import.meta.env.VITE_API_URL": JSON.stringify(
            process.env.VITE_API_URL || "http://localhost:8080",
        ),
        "import.meta.env.VITE_APP_ENV": JSON.stringify(
            process.env.VITE_APP_ENV || "development",
        ),
    },

    build: {
        sourcemap: true,
    },
    cacheDir: "node_modules/.vite",
    plugins: [tailwindcss(),],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
