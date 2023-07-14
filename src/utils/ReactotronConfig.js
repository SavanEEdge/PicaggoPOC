import Reactotron from 'reactotron-react-native'

Reactotron
  .configure({
    name: 'Picaggo POC',
    host: '192.168.1.3',
    port: 9090
  }) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .connect() // let's connect!
