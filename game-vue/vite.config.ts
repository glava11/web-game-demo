import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
      },
      format: {
        comments: false,
      },
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "pinia"],
          confetti: ["canvas-confetti"],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Source maps for debugging (disable for production if needed)
    sourcemap: false,
  },
  // Performance optimizations
  optimizeDeps: {
    include: ["vue", "pinia", "canvas-confetti"],
  },
});
