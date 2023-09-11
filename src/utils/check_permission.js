import {Platform} from 'react-native';
import {isAndroid} from './helper';

export class CheckPermission {
  static verifySaveFilePermission() {
    if (!isAndroid) {
      return true;
    }
    console.log('Information', Platform.Version, Platform.constants);
  }
}
