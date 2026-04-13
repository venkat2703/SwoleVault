module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Decorator plugin MUST come before other plugins
      ['@babel/plugin-proposal-decorators', { legacy: true }],
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