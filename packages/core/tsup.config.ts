import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  treeshake: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'gsap', '@gsap/react'],
});
