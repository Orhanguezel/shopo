// client/vite.config.ts
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import path from "node:path";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const API_TARGET = env.VITE_API_URL || "http://localhost:5019";
  const APP_BASE = (env.VITE_APP_BASE || "/").replace(/\/?$/, "/");

  // Bun ya da env ile polling'i aç/kapat
  const isBun = !!process.versions?.bun;
  const usePolling =
    isBun ||
    env.VITE_CHOKIDAR_USEPOLLING === "1" ||
    env.CHOKIDAR_USEPOLLING === "1";

  const pwaConfig = { /* ... mevcut pwa ayarın ... */ };

  return {
    base: APP_BASE,
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "babel-plugin-styled-components",
              { displayName: true, fileName: false, pure: true, ssr: false },
            ],
          ],
        },
      }),
      VitePWA(pwaConfig),
    ],
    resolve: {
      alias: [
        // Önce spesifikler
        { find: /^@api\//,  replacement: path.resolve(__dirname, "api-manage") + "/" },
        { find: /^@i18n\//, replacement: path.resolve(__dirname, "i18n") + "/" },
        { find: /^@assets\//, replacement: path.resolve(__dirname, "src/assets") + "/" },

        // En sonda genel src alias'ı (sadece "@/..." yakalasın)
        { find: /^@\//, replacement: path.resolve(__dirname, "src") + "/" },

        // İsteğe bağlı kısa yollar
        { find: "@routes",     replacement: path.resolve(__dirname, "src/routes") },
        { find: "@features",   replacement: path.resolve(__dirname, "src/features") },
        { find: "@lib",        replacement: path.resolve(__dirname, "src/lib") },
        { find: "@components", replacement: path.resolve(__dirname, "src/components") },
      ],
    },
    server: {
      proxy: {
        "/api": { target: API_TARGET, changeOrigin: true, secure: false },
      },
      // ⬇️ EINVAL için güvenli watcher ayarları
      watch: {
        usePolling,
        interval: Number(env.VITE_CHOKIDAR_INTERVAL || 200),
        awaitWriteFinish: {
          stabilityThreshold: Number(env.VITE_AWF_STABILITY || 200),
          pollInterval: Number(env.VITE_AWF_POLL || 100),
        },
        ignored: [
          "**/.git/**",
          "**/dist/**",
          "**/.next/**",
          "**/.cache/**",
          "**/coverage/**",
          "**/tmp/**",
        ],
      },
    },
    preview: {
      proxy: {
        "/api": { target: API_TARGET, changeOrigin: true, secure: false },
      },
    },
    build: { sourcemap: mode !== "production", target: "es2020" },
  };
});
