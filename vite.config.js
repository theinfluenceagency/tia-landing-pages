import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// One entry per landing page. Output names are stable (no hashes) so the Webflow page can
// point at a fixed URL; versioning happens through git tags on the jsDelivr URL instead.
// Each page is built on its own (`LP=seo-lp vite build`) so every entry stays a single
// self-contained file with its own React copy. A shared chunk would tie the two pages'
// release tags together and add a second request on every ad click.
const ENTRIES = {
  "seo-lp": "src/entries/seo-lp.jsx",
  "aeo-lp": "src/entries/aeo-lp.jsx",
};
const only = process.env.LP;
const input = only ? { [only]: ENTRIES[only] } : ENTRIES;

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist",
    // `npm run build` clears dist itself, then runs one build per page.
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input,
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "[name][extname]",
        // Use IIFE-style single file per entry: avoids module CORS quirks on Webflow
        format: "es",
        manualChunks: undefined,
        inlineDynamicImports: !!only,
      },
    },
    target: "es2019",
    sourcemap: false,
  },
});
