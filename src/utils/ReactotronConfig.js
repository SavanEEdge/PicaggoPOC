import Reactotron from 'reactotron-react-native';
import {reactotronRedux} from 'reactotron-redux';

const reactotron = Reactotron.configure({
  name: 'Picaggo POC',
  host: '192.168.1.7',
  port: 9090,
}) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .use(reactotronRedux())
  .connect();

export default reactotron;
