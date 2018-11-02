import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const babelConfig = { exclude: 'node_modules/**' };
const minifyConfig = { comments: false };

export default [
  {
    input: 'resources/index.js',
    output: {
      name: 'index',
      file: 'dist/index.min.js',
      format: 'umd'
    },
    interop: false,
    plugins: [
      babel(babelConfig),
      minify(minifyConfig),
      uglify()
    ]
  },
  {
    input: 'resources/browser.js',
    output: {
      name: 'index',
      file: 'dist/vanillajs-validation.min.js',
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel(babelConfig),
      minify(minifyConfig),
      uglify()
    ]
  }
]
