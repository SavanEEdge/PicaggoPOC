module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  "plugins": [["@babel/plugin-transform-private-methods", { "loose": true }]]
  // plugins: [
  //   [
  //     'module-resolver',
  //     {
  //       alias: {
  //         'stream': 'stream-browserify',
  //         'buffer': '@craftzdog/react-native-buffer',
  //       },
  //     },
  //   ],
  // ]
};
