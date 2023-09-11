import {PermissionsAndroid, Platform, ToastAndroid} from 'react-native';
import {isAndroid} from './helper';

export class CheckPermission {
  static async verifySaveFilePermission() {
    if (!isAndroid) {
      return true;
    }
    if (Platform.Version > 29) {
      return true;
    }
    try {
      const granted = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (!granted) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async verifyReadGalleryPermission() {
    if (!isAndroid) {
      return true;
    }
    try {
      let permissions;

      if (Platform.Version < 30) {
        permissions = [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
      } else {
        permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ];
      }

      const granted = await CheckPermission.checkMultiple(permissions);
      console.log('granted ', granted);
      if (Platform.Version < 30) {
        const permissionReadGranted =
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
        if (!permissionReadGranted) {
          const result = await PermissionsAndroid.requestMultiple(permissions);

          if (
            result[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            return true;
          } else {
            ToastAndroid.show(
              'Please go to settings and allow permissions.',
              ToastAndroid.LONG,
            );
            return false;
          }
        } else {
          console.log('Permissions are granted');
          return true;
        }
      } else {
        const permissionImagesGranted =
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES];
        const permissionVideoGranted =
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO];

        if (!permissionImagesGranted || !permissionVideoGranted) {
          const result = await PermissionsAndroid.requestMultiple(permissions);

          if (
            result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            return true;
          } else {
            ToastAndroid.show(
              'Please go to settings and allow permissions.',
              ToastAndroid.LONG,
            );
            return false;
          }
        } else {
          console.log('Permissions are granted');
          return true;
        }
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async checkMultiple(permissions = []) {
    const results = {};

    for (const permission of permissions) {
      const result = await PermissionsAndroid.check(permission);
      results[permission] = result;
    }

    return results;
  }
}
