import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
               target: "https://103.90.226.216:8443/",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});