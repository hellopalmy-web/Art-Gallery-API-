const path = require("node:path");

module.exports = {
    root: path.resolve(__dirname, "frontend"),
    base: "/",
    esbuild: {
        jsx: "automatic",
    },
    server: {
        host: "0.0.0.0",
        proxy: {
            "/api": {
                target: process.env.API_PROXY_TARGET || `http://localhost:${process.env.API_PORT || "3000"}`,
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: path.resolve(__dirname, "frontend-dist"),
        emptyOutDir: true,
    },
};