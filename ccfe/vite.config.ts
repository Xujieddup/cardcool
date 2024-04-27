import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
// import Spritesmith from "vite-plugin-spritesmith"
import { visualizer } from "rollup-plugin-visualizer"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]",
      inject: "body-last",
      customDomId: "svgIcons",
    }),
    // Spritesmith({
    //   src: {
    //     cwd: "./src/assets/emojis",
    //     glob: "*.png",
    //   },
    //   target: {
    //     image: "./src/assets/emojis.png",
    //     css: "./src/assets/emojis.css",
    //   },
    //   apiOptions: {
    //     cssImageRef: "emojis.png",
    //   },
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
