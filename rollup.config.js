import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { string } from 'rollup-plugin-string'
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        name: 'vuepress-plugin-autodoc',
      },
      {
        file: 'dist/index.min.js',
        format: 'cjs',
        name: 'vuepress-plugin-autodoc',
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      string({
        include: "**/*.css",
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
]
