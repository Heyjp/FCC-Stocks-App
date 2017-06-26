const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AureliaWebpackPlugin = require('aurelia-webpack-plugin');
//const BabiliPlugin = require('babili-webpack-plugin'); // ES6 compatible minfication/compresion

module.exports = {
  entry: {
    main: [
      './ie-polyfill',
      'aurelia-bootstrapper'
    ]
  },

  output: {
    path: path.resolve('../public/', 'dist'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].js'
  },

  resolve: {
    extensions: ['.js'],
    modules: ['src', 'node_modules'],
  },

  module: {

    rules: [
      { test: /\.(js)$/,
        loaders: 'babel-loader',
        exclude: /node_modules/,
        query: { // use 'babel-preset-env' without transforming ES6 modules, and with added support for decorators
          presets: [['env', { modules: false }]],
          plugins: ['transform-class-properties', 'transform-decorators-legacy']
        }
      },
      {
       // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
       test: /\.css$/i,
       use: ['style-loader'],
       issuer: {
         // only when the issuer is a .js/.ts file, so the loaders are not applied inside templates
         test: /\.[tj]s$/i,
       },
     },
     {
       // CSS anywhere should use the css-loader
       test: /\.css$/i,
       use: ['css-loader'],
     },
      { test: /\.html$/i,
        use: 'html-loader' }
    ]
  },

  plugins: [

    // required polyfills for non-evergreen browsers
    new webpack.ProvidePlugin({
        Map: 'core-js/es6/map',
        WeakMap: 'core-js/es6/weak-map',
        Promise: 'core-js/es6/promise',
        regeneratorRuntime: 'regenerator-runtime' // to support await/async syntax
    }),


    // init aurelia-webpack-plugin
    new AureliaWebpackPlugin.AureliaPlugin(),

    // have Webpack copy over the index.html and inject appropriate script tag for Webpack-bundled entry point 'main.js'
    new HtmlWebpackPlugin({
        template: '!html-webpack-plugin/lib/loader!index.html',
        filename: 'index.html'
    })

  ]
};
