import { resolve } from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import commonjs from "@rollup/plugin-commonjs"
import pkg from "./package.json"

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
  resolve: {
    alias: [
      // resolve package.json "imports" field
      // https://github.com/vitejs/vite/issues/7385#issue-1174476084
      {
        find: /^#/,
        replacement: "#",
        customResolver(id) {
          for (const [src, dest] of Object.entries(pkg.imports)) {
            const match = matchIdentifier(id, src)
            if (match !== false) return resolve(dest.replace("*", match))
          }
          return id
        }
      }
    ]
  },
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  plugins: [react(), commonjs()]
})

function matchIdentifier(id, pat) {
  const re = new RegExp(`^${pat.replace("*", "(.*)")}$`)
  return id.match(re)?.[1] ?? false
}
