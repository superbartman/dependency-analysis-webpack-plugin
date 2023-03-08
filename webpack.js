const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'index': './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: 'DependencyAnalysisWebpackPlugin',
      type: 'commonjs',
    },
    clean: true,
  },
  target: 'node',
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: [
          {
            loader: 'ts-loader',
            options: { transpileOnly: true }
          }
        ]
      },
    ],
  },
};
