import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@features": path.resolve(__dirname, "./src/features"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
            "@services": path.resolve(__dirname, "./src/services"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@config": path.resolve(__dirname, "./src/config"),
            "@assets": path.resolve(__dirname, "./src/assets"),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "https://103.90.226.216:8443",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
                configure: (proxy) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request:', req.method, req.url);
                        try {
                            proxyReq.setHeader('origin', 'http://103.90.226.216:3000');
                        } catch (e) {
                            // ignore
                        }
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
        cors: true,
    },
});