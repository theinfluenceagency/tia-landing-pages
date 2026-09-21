import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// One entry per landing page. Output names are stable (no hashes) so the Webflow page can
// point at a fixed URL; versioning happens through git tags on the jsDelivr URL instead.
export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        "seo-lp": "src/entries/seo-lp.jsx",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "[name][extname]",
        // Use IIFE-style single file per entry: avoids module CORS quirks on Webflow
        format: "es",
        manualChunks: undefined,
        inlineDynamicImports: false,
      },
    },
    target: "es2019",
    sourcemap: false,
  },
});
