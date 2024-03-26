import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/client-side/index.ts',
    output: {
      file: '_site/scripts/index.min.js',
      sourcemap: '_site/scripts/index.min.js.map',
      inlineDynamicImports: true,
    },
    plugins: [
      typescript(),
      terser(),
    ],
  },
  {
    input: 'src/client-side/page-search.ts',
    output: {
      file: '_site/scripts/page-search.min.js',
      sourcemap: '_site/scripts/page-search.min.js.map',
    },
    plugins: [
      typescript(),
      terser(),
    ],
  },
]