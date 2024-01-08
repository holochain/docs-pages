import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
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
  {
    input: 'src/client-side/mermaid.ts',
    output: {
      file: '_site/scripts/mermaid.min.js',
      sourcemap: '_site/scripts/mermaid.min.js.map',
      inlineDynamicImports: true,
    },
    plugins: [
      typescript(),
      nodeResolve({
          browser: true
      }),
      commonjs({
        include: /node_modules/,
      }),
      terser(),
    ],
  },
]