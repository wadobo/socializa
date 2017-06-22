var path = require('path');
var webpack = require('webpack');

var dependencies = [
  'react', 'react-dom',
  'html-purify',
  'jquery',
  'fetch'
];

module.exports = {
  entry: {
    vendors: dependencies,
    gameeditor: './src/game-editor.js',
    eventeditor: './src/event-editor.js',
  },
  output: {
    path: path.resolve(__dirname, '..', 'static'),
    filename: '[name].js'
  },
  plugins: [
      new webpack.optimize.CommonsChunkPlugin({
          name: 'vendors'
      }),
      new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery"
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
