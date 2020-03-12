/**
 * Webpack configuration file for bundling package.
 */

// imports
const path = require('path');

// exports
module.exports = (env, argv) => {
  return {
    entry: [
      path.resolve(__dirname, 'src', 'index.js'),
    ],
    mode: argv.mode || 'production',
    output: {
       path: path.resolve(__dirname, 'dist'),
       filename: argv.mode === 'development' ? 'index.js' : 'index.min.js'
    },
    resolve: {
       extensions: ['.js']
    },
    module: {
       rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['@babel/preset-env'],
            }
          },
       ]
    }
  }
};
