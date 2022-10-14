import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
  build:{
    // target: "es2015",
  },
  define: {
    "global": "window",
    "process.env.NODE_ENV": `"${mode}"`
  },
  optimizeDeps: {
    include: [
      // "specviz.js"
    ],
    exclude: [

    ]
  },
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  plugins: [react(), commonjs()]
})
