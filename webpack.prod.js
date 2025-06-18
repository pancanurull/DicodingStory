const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      additionalManifestEntries: [ 
        { url: '/index.html', revision: '1' },
        { url: '/404.html', revision: '1' },
      ],
      runtimeCaching: [
        {
          urlPattern: /\.(?:js|css|html)$/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'static-assets' },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
          },
        },
        {
          urlPattern: new RegExp('^https://story-api.dicoding.dev'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
          },
        },
      ],
        mode: 'production',
        sourcemap: false,
        swDest: 'sw.js' 
    }),
  ],
});