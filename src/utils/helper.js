import CRC32 from 'crc-32';
import moment from 'moment';
import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

export function generateFileName(name, user_id, date) {
    return getHash(user_id + date + name) + "-" + getHash(user_id + date) + "-" + getHash(name + date) + "." + getFileExtension(name);
}
export function getHash(message) {
    // return CRC32.str(message);
    const crc = CRC32.str(message);
    const formattedCRC = ("00000000" + crc.toString(16)).substr(-8).toUpperCase();
    return formattedCRC;
}

function getFileExtension(filename) {
    return filename.split('.').pop();
}

export function getUnixTimeSteamp(days = '') {
    const startTime = moment.utc().unix();
    const endTime = moment.utc().add(days, 'days').unix();
    return { startTime, endTime };
}

export function convertUnixTimeSteamp(utcTime) {
    return moment.utc(utcTime).unix();
}

export function encodedData(data) {
    return Object.entries(data)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
}

export function mergedArr(mainArray, fetchedArray) {
    const finalArrayPath = mainArray.map(obj => obj.path);
    const uniqueArr2Objs = fetchedArray.filter(obj => !finalArrayPath.includes(obj.path));
    return [...mainArray, ...uniqueArr2Objs];
}

export function requestPermission() {
    return new Promise((resolve, reject) => {
        if (Platform.OS === "android") {
            if (Platform.constants['Release'] >= 13) {
                PermissionsAndroid.requestMultiple(
                    [PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO]
                ).then((result) => {
                    if (result['android.permission.READ_MEDIA_IMAGES']
                        && result['android.permission.READ_MEDIA_VIDEO']
                        === 'granted') {
                        resolve(true)
                    } else if (result['android.permission.READ_MEDIA_IMAGES']
                        || result['android.permission.READ_MEDIA_VIDEO'] === 'never_ask_again') {
                        ToastAndroid.show('Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue');
                        resolve(false)
                    }
                });
            } else {
                PermissionsAndroid.requestMultiple(
                    [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
                ).then((result) => {
                    if (result['android.permission.READ_EXTERNAL_STORAGE']
                        && result['android.permission.WRITE_EXTERNAL_STORAGE']
                        === 'granted') {
                        resolve(true)
                    } else if (result['android.permission.READ_EXTERNAL_STORAGE']
                        || result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'never_ask_again') {
                        ToastAndroid.show('Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue');
                        resolve(false)
                    }
                });
            }
        }
        resolve(true)
    })
}

function isImageFile(filename) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();

    return imageExtensions.includes(extension);
}

export function getCameraAssets(filterFunction) {
    return new Promise(async (resolve, reject) => {
        if (Platform.OS === "android") {
            const cameraPath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera`;
            try {
                const cameraFiles = await RNFS.readDir(cameraPath);
                resolve(cameraFiles.map(i => ({
                    ctime: i.ctime,
                    mtime: `${i.mtime}`,
                    name: i.name,
                    path: i.path,
                    size: i.size,
                    timeStamp: convertUnixTimeSteamp(i.mtime),
                    uri: `file://${i.path}`,
                    isImage: isImageFile(i.name),
                    isUploaded: false
                })).filter(filterFunction));
            } catch (error) {
                reject(error);
            }
        } else if (Platform.OS === "ios") {
            try {
                const photos = await RNFetchBlob.fs.ls('photos');
                const photosDetails = await Promise.all(
                    photos.map(async photo => ({
                        path: photo,
                        ...await RNFetchBlob.fs.stat(photo),
                        isImage: isImageFile(photo),
                    }))
                );
                resolve(photosDetails)
            } catch (error) {
                reject(error);
            }
        }
    })
}