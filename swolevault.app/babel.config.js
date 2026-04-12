module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './src/assets',
            '@components': './src/components',
            '@screens': './src/screens',
            '@database': './src/database',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
          },
        },
      ],
    ],
  };
};