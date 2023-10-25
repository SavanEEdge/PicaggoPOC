import crc from 'crc';
import moment from 'moment';
import {PermissionsAndroid, Platform, ToastAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

import * as mime from 'react-native-mime-types';

import {Image, Video, getRealPath} from 'react-native-compressor';
import {Linking} from 'react-native';
import {createThumbnail} from '../third_party/react-native-create-thumbnail';
import reactotron from 'reactotron-react-native';

export const isAndroid = Platform.OS === 'android';

export function generateFileName(name, user_id, date) {
  if (!name) {
    return '';
  }
  if (!user_id) {
    return '';
  }
  if (!date) {
    return '';
  }

  return (
    getHash(user_id + date + name) +
    '-' +
    getHash(user_id + date) +
    '-' +
    getHash(name + date) +
    '.' +
    getFileExtension(name)
  );
}

function getHash(message) {
  const byteArray = new TextEncoder().encode(message);
  return crc.crc32(byteArray).toString(16)?.toUpperCase();
}

export async function getMD5(filePath) {
  try {
    const hash = await RNFetchBlob.fs.hash(filePath, 'md5');

    console.log('MD5 Hash', hash);
    return hash;
  } catch (error) {
    // Handle any errors
    console.error('Generating file error: ', error);
  }
}

function getFileExtension(filename) {
  return filename.split('.').pop();
}

export function getUnixTimeSteamp(days = '') {
  const startTime = moment.utc().unix();
  const endTime = moment.utc().add(days, 'days').unix();
  return {startTime, endTime};
}

export function convertUnixTimeSteamp(utcTime) {
  return moment.utc(utcTime).unix();
}

export function encodedData(data) {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}

export function mergedArr(mainArray, fetchedArray) {
  const finalArrayPath = mainArray.map(obj => obj.path);
  const uniqueArr2Objs = fetchedArray.filter(
    obj => !finalArrayPath.includes(obj.path),
  );
  return [...mainArray, ...uniqueArr2Objs];
}

// export async function requestPermission() {
//   if (Platform.OS === 'android') {
//     try {
//       let permissions = [];
//       const isAndroid33OrAbove = Platform.Version >= 33;
//       if (isAndroid33OrAbove) {
//         permissions = [
//           PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
//           PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
//         ];
//       } else {
//         permissions = [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
//         if (Platform.Version < 23) {
//           permissions.push(
//             PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//           );
//         }
//       }

//       const result = await PermissionsAndroid.requestMultiple(permissions);
//       if (isAndroid33OrAbove) {
//         if (
//           result['android.permission.READ_MEDIA_IMAGES'] ===
//             PermissionsAndroid.RESULTS.GRANTED &&
//           result['android.permission.READ_MEDIA_VIDEO'] ===
//             PermissionsAndroid.RESULTS.GRANTED
//         ) {
//           return true;
//         } else if (
//           result['android.permission.READ_MEDIA_IMAGES'] ===
//             PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
//           result['android.permission.READ_MEDIA_VIDEO'] ===
//             PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
//         ) {
//           ToastAndroid.show(
//             'Please Allow permissions to continue',
//             ToastAndroid.LONG,
//           );
//           Linking.openSettings();
//         }
//       } else {
//         if (
//           result['android.permission.READ_EXTERNAL_STORAGE'] ===
//             PermissionsAndroid.RESULTS.GRANTED &&
//           (Platform.Version < 23 ||
//             result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
//               PermissionsAndroid.RESULTS.GRANTED)
//         ) {
//           return true;
//         } else if (
//           result['android.permission.READ_EXTERNAL_STORAGE'] ===
//           PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
//         ) {
//           ToastAndroid.show(
//             'Please Allow permissions to continue',
//             ToastAndroid.LONG,
//           );
//           Linking.openSettings();
//         }
//       }
//       return false;
//     } catch (error) {
//       console.error('Permission request error:', error);
//       return false;
//     }
//   }

//   return true;
// }

export async function requestPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    let permissions = [];
    const isAndroid33OrAbove = Platform.Version >= 33;

    if (isAndroid33OrAbove) {
      permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ];
    } else {
      permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ...(Platform.Version < 23
          ? [PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
          : []),
      ];
    }

    const result = await PermissionsAndroid.requestMultiple(permissions);

    if (isAndroid33OrAbove) {
      if (
        result['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.READ_MEDIA_VIDEO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else if (
        result['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        result['android.permission.READ_MEDIA_VIDEO'] ===
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ) {
        ToastAndroid.show(
          'Please Allow permissions to continue',
          ToastAndroid.LONG,
        );
        Linking.openSettings();
      }
    } else {
      if (
        result['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        (Platform.Version < 23 ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED)
      ) {
        return true;
      } else if (
        result['android.permission.READ_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ) {
        ToastAndroid.show(
          'Please Allow permissions to continue',
          ToastAndroid.LONG,
        );
        Linking.openSettings();
      }
    }

    return false;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
}

function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  return imageExtensions.includes(extension);
}

export function getCameraAssets(filterFunction) {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'android') {
      const cameraPath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera`;
      try {
        const cameraFiles = await RNFS.readDir(cameraPath);

        // console.log('cameraFiles ', JSON.stringify(cameraFiles, null, 2));

        resolve([].filter(filterFunction));
      } catch (error) {
        reject(error);
      }
    } else if (Platform.OS === 'ios') {
      try {
        const photos = await RNFetchBlob.fs.ls('photos');
        const photosDetails = await Promise.all(
          photos.map(async photo => ({
            path: photo,
            ...(await RNFetchBlob.fs.stat(photo)),
            isImage: isImageFile(photo),
          })),
        );
        resolve(photosDetails);
      } catch (error) {
        reject(error);
      }
    }
  });
}

export function getAssetsByEventTime(unixStartTime, unixEndTime) {
  return new Promise(async (resolve, reject) => {
    try {
      const assets = await CameraRoll.getPhotos({
        first: 100000,
        assetType: 'All',
        fromTime: unixStartTime * 1000,
        toTime: unixEndTime * 1000,
      });

      const map = assets.edges.map(obj => ({
        ctime: '',
        mtime: '',
        name: getFileName(obj?.node?.image?.uri),
        path: obj?.node?.image?.uri,
        size: -1,
        timeStamp: obj?.node?.timestamp,
        uri: obj?.node?.image?.uri,
        isImage: isImageFile(getFileName(obj?.node?.image?.uri)),
        isUploaded: false,
      }));
      resolve(map);
      // console.log('assets ', JSON.stringify(assets, null, 2));
    } catch (e) {
      reject(e);
    }
  });
}

export async function deleteFile(filePath) {
  // try {
  //   await RNFS.unlink(filePath);
  //   console.log('File deleted successfully.');
  // } catch (error) {
  //   console.error(error);
  // }
}

export function getFileName(filePath = '') {
  if (!filePath || filePath === '') {
    return '';
  }

  return filePath.split('/').pop();
}

export async function getFileDetails(filePath) {
  try {
    const statResult = await RNFS.stat(filePath);

    // Extract the file details
    const {size, ctime, mtime} = statResult; // need to check on ios

    // Convert the size to a human-readable format
    const fileSizeInBytes = size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;

    return {
      name: getFileName(filePath),
      path: filePath,
      base64: await getBase64(filePath),
      type: mime.lookup(filePath),
      size: fileSizeInBytes,
      sizeInKB: fileSizeInKB,
      sizeInMB: fileSizeInMB,
      creationTime: ctime,
      modificationTime: mtime,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function compressImageFile(filePath) {
  try {
    const compressedFilePath = await Image.compress(filePath, {
      compressionMethod: 'auto',
    });
    // Handle the compressed file
    const fileName = getFileName(compressedFilePath);
    const cacheDirectoryPath = RNFS.CachesDirectoryPath;
    const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
    const compressedFileDetails = await getFileDetails(
      filePathForCompressedFile,
    );
    const orignalFileDetails = await getFileDetails(filePath);

    if (compressedFileDetails.sizeInKB <= 500) {
      return {compressedFileDetails, orignalFileDetails};
    }
    return compressImageFile(compressedFileDetails.path);
  } catch (error) {
    console.error('Image Compression Error: ', error);
    return null;
  }
}

export async function getVideoFileDetails(filePath) {
  try {
    const statResult = await RNFS.stat(filePath);
    // Extract the file details
    const {size, ctime, mtime} = statResult; // need to check on ios

    // Convert the size to a human-readable format
    const fileSizeInBytes = size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;

    return {
      name: getFileName(filePath),
      path: filePath,
      type: mime.lookup(filePath),
      size: fileSizeInBytes,
      sizeInKB: fileSizeInKB,
      sizeInMB: fileSizeInMB,
      creationTime: ctime,
      modificationTime: mtime,
    };
  } catch (error) {
    console.error(filePath, ' : ', error);
    return null;
  }
}

export async function compressVideoFile(filePath) {
  try {
    const orignalFileDetails = await getVideoFileDetails(filePath);

    if (orignalFileDetails.sizeInMB < 17) {
      return {compressedFileDetails: orignalFileDetails, orignalFileDetails};
    }

    const compressedFilePath = await Video.compress(
      filePath,
      {compressionMethod: 'auto'},
      progress => {
        console.log('Compressor Progress ', progress);
      },
    );
    // Handle the compressed file
    const fileName = getFileName(compressedFilePath);
    const cacheDirectoryPath = RNFS.CachesDirectoryPath;
    const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
    const compressedFileDetails = await getVideoFileDetails(
      filePathForCompressedFile,
    );
    return {compressedFileDetails, orignalFileDetails};
  } catch (error) {
    console.error('Image Compression Error: ', error);
    return null;
  }
}

export function parseJson(string) {
  return JSON.parse(JSON.stringify(string));
}

export function sleep(time) {
  return new Promise(resolve => setTimeout(() => resolve(), time));
}

export async function fetchResourceFromURI(uri) {
  try {
    const fileContents = await getBase64(uri);
    const blob = new Blob([fileContents], {type: 'application/octet-stream'});
    // console.log("blob", blob);
    return blob;
  } catch (e) {
    console.log('fetchResourceFromURI', e);
  }
}

export async function getVideoThumbnail(uri) {
  if (Platform.OS === 'android') {
    const thumbnail_response = await createThumbnail({
      url: uri,
      timeStamp: 1000,
      format: 'jpeg',
      cacheName: `${uri?.split('/').pop()}_thumb`,
    });

    return {
      ...thumbnail_response,
      path: `${RNFS.CachesDirectoryPath}/thumbnails/${thumbnail_response?.path
        ?.split('/')
        .pop()}`,
    };
  }
}

export async function getBase64(filePath) {
  const base64 = await RNFS.readFile(filePath, 'base64');
  return base64;
}
