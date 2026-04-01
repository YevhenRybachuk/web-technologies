const path = require('path');

module.exports = {
  entry: {
    app: './js/app1.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app1.js',
  },
};
