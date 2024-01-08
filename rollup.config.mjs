import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/client-side/index.ts',
    output: {
      file: '_site/scripts/index.js',
      sourcemap: '_site/scripts/index.js.map',
      inlineDynamicImports: true,
    },
    plugins: [
      typescript(),
    ],
  },
  {
    input: 'src/client-side/page-search.ts',
    output: {
      file: '_site/scripts/page-search.js',
      sourcemap: '_site/scripts/page-search.js.map',
    },
    plugins: [
      typescript()
    ],
  },
  {
    input: 'src/client-side/mermaid.ts',
    output: {
      file: '_site/scripts/mermaid.js',
      sourcemap: '_site/scripts/mermaid.js.map',
      inlineDynamicImports: true,
    },
    plugins: [
      typescript(),
      nodeResolve({
          browser: true
        }
      ),
      commonjs({
        include: /node_modules/,
      }),
      terser(),
    ],
  },
]