import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import {crx} from "@crxjs/vite-plugin";
// import manifest from "./manifest.json";
const manifest = require('./manifest.json');

// console.log(manifest);
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
    react(),
  svgr({
    svgrOptions: {
      icon: true,
    }
  }),
  crx({manifest})  
],
  build: {
    manifest: true
  }
}
)
