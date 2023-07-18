import {
  Platform,
  NativeModules,
  NativeAppEventEmitter,
  DeviceEventEmitter,
  DeviceEventEmitterStatic,
} from 'react-native';
let listener: DeviceEventEmitterStatic;

if (Platform.OS === 'ios') {
  listener = NativeAppEventEmitter;
} else {
  listener = DeviceEventEmitter;
}

const LINKING_ERROR =
  `The package 'react-native-s3-transfer-utility-v2' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export class S3TransferUtility {
  listener: DeviceEventEmitterStatic;
  S3TransferUtilityV2: any;
  private static instance: S3TransferUtility | null = null;
  private isInitialization = false;

  constructor() {
    if (Platform.OS === 'ios') {
      this.listener = NativeAppEventEmitter;
    } else {
      this.listener = DeviceEventEmitter;
    }

    this.S3TransferUtilityV2 = NativeModules.S3TransferUtilityV2
      ? NativeModules.S3TransferUtilityV2
      : new Proxy(
          {},
          {
            get() {
              throw new Error(LINKING_ERROR);
            },
          },
        );
  }

  static getInstance(): S3TransferUtility {
    if (!S3TransferUtility.instance) {
      S3TransferUtility.instance = new S3TransferUtility();
    }
    return S3TransferUtility.instance;
  }

  async initWithOptions(options: {
    region: string;
    poll_id: string;
    google_jwt_token: string;
    ios_region: number;
  }) {
    if (!this.isInitialization) {
      if (!options.region || options.region === '') {
        console.error('undefined region field');
        return false;
      }
      if (!options.poll_id || options.poll_id === '') {
        console.error('undefined poll_id field');
        return false;
      }
      if (!options.google_jwt_token || options.google_jwt_token === '') {
        console.error('undefined google_jwt_token field');
        return false;
      }
      if (Platform.OS === 'ios') {
        if (!options.ios_region || options.ios_region === 0) {
          console.error('undefined ios_region field');
          return false;
        }
      }
      const isInit = await this.S3TransferUtilityV2.initWithOptions(options);
      this.isInitialization = isInit;
      return isInit;
    } else {
      return true;
    }
  }

  createUploadRequest(options: {
    bucket: string;
    key: string;
    path: string;
    mime_type: string;
    event_id: string;
    user_id: string;
    subscribe: boolean;
    completionhandler: boolean;
  }) {
    if (!options.bucket || options.bucket === '') {
      console.error('undefined bucket field');
      return '';
    }
    if (!options.key || options.key === '') {
      console.error('undefined key field');
      return '';
    }
    if (!options.path || options.path === '') {
      console.error('undefined path field');
      return '';
    }
    if (!options.mime_type || options.mime_type === '') {
      console.error('undefined mime_type field');
      return '';
    }
    if (!options.event_id || options.event_id === '') {
      console.error('undefined event_id field');
      return '';
    }
    if (!options.user_id || options.user_id === '') {
      console.error('undefined path field');
      return '';
    }
    options.subscribe = options?.subscribe ?? true;
    options.completionhandler = options?.completionhandler ?? true;

    return this.S3TransferUtilityV2.createUploadRequest(options);
  }

  upload(options: {requestId: string}) {
    if (!options.requestId || options.requestId === '') {
      console.error('undefined requestID field');
      return;
    }

    return this.S3TransferUtilityV2.upload(options);
  }

  deleteFile(options: {bucket: string; key: string}) {
    if (!options.bucket || options.bucket === '') {
      console.error('undefined bucket field');
      return false;
    }
    if (!options.key || options.key === '') {
      console.error('undefined key field');
      return false;
    }

    return this.S3TransferUtilityV2.deleteFile(options);
  }

  checkFile(options: {bucket: string; key: string}) {
    if (!options.bucket || options.bucket === '') {
      console.error('undefined bucket field');
      return false;
    }
    if (!options.key || options.key === '') {
      console.error('undefined key field');
      return false;
    }

    return this.S3TransferUtilityV2.checkFile(options);
  }
}
