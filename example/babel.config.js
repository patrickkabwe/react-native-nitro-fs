const path = require('path');
const pak = require('../package.json');

module.exports = api => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.ts', '.json', '.jsx', '.tsx'],
          alias: {
            [pak.name]: path.join(__dirname, '../', pak.source),
          },
        },
      ],
    ],
  };
};