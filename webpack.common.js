const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/public',
          to: '.',
          globOptions: {
            ignore: ['**/README.md'],
          },
        },
        {
          from: 'src/manifest.json',
          to: '.'
        },
        {
          from: 'src/screenshots',
          to: 'screenshots',
          noErrorOnMissing: true,
        }
      ],
    }),
  ],
};