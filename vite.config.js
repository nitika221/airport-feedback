import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  cacheDir: "work/.vite",
  plugins: [react()],
});