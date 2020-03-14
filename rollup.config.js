import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { string } from 'rollup-plugin-string'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        name: 'vuepress-plugin-autodoc',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        name: 'vuepress-plugin-autodoc',
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
