var path = require('path');
var webpack = require('webpack');

var dependencies = [
  'react', 'react-dom', 'react-router', 'qrcode.react',
  'html-purify',
  'jquery',
  'bootstrap',
  'openlayers',
  'moment',
  'fetch'
];

module.exports = {
  entry: {
    vendors: dependencies,
    main: './src/main.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'app'),
    filename: '[name].js'
  },
  plugins: [
      new webpack.optimize.CommonsChunkPlugin({
          name: 'vendors'
      })
  ],
  module: {
    rules: [
      {
        test: /.js?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['es2015', 'react'],
                plugins: [
                  ["transform-class-properties", { spec: true }]
                ]
            }
        }
      }
    ]
  },
  node: {
    dns: 'mock',
    fs: 'empty',
    net: 'mock'
  },
};
