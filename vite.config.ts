import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [tsconfigPaths(), reactRouter()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:3000",
        rewriteWsOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:3000",
        rewriteWsOrigin: true,
        ws: true,
      },
    },
  },
});
