import { defineConfig } from "vite"

import path from "path"

import vue from "@vitejs/plugin-vue"
import svgLoader from "vite-svg-loader"

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(async () => ({
	plugins: [vue(), svgLoader()],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421
				}
			: undefined,
		watch: {
			ignored: ["**/src-tauri/**"]
		}
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	}
}))
