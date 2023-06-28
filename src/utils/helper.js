import crc from 'crc';
import moment from 'moment';
import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import md5 from 'md5';
import Crypto from 'react-native-quick-crypto'

import { Image } from 'react-native-compressor';

export function generateFileName(name, user_id, date) {
    if (!name) return '';
    if (!user_id) return '';
    if (!date) return '';

    return getHash(user_id + date + name) + "-" + getHash(user_id + date) + "-" + getHash(name + date) + "." + getFileExtension(name);
}

function getHash(message) {
    const byteArray = new TextEncoder().encode(message);
    return crc.crc32(byteArray).toString(16)?.toUpperCase();
}

export async function getMD5(string) {
    try {
        const hash = await calculateMD5(string);
        console.log("hash", hash);
        return hash;
    } catch (error) {
        // Handle any errors
        console.error("Generating file error: ", error);
    }
}

async function calculateMD5(filename) {
    const isPermission = await requestPermission();
    if (isPermission) {
        const path = `${RNFS.ExternalStorageDirectoryPath}/dcim/camera/${filename}`;
        const stat = await RNFetchBlob.fs.hash(path, "md5");

        console.log("Full path", stat);
        // const absoultePath = RNFS.
        // const hash = await RNFS.hash(path, "md5");
        // console.log("inside hash", hash);
        return '';
        // const hash = Crypto.createHash('md5');

        // return new Promise((resolve, reject) => {
        //     fileStream.on('data', (chunk) => {
        //         hash.update(chunk);
        //     });

        //     fileStream.on('end', () => {
        //         const md5Hash = hash.digest('hex');
        //         console.log("inside hash", hash);
        //         resolve(md5Hash);
        //     });

        //     fileStream.on('error', (error) => {
        //         reject(error);
        //     });
        // });
    }
    return '';
};

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

export async function deleteFile(filePath) {
    try {
        await RNFS.unlink(filePath);
        console.log('File deleted successfully.');
    } catch (error) {
        console.error(error);
    }
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
        const base64 = await RNFS.readFile(filePath, 'base64');

        // Extract the file details
        const { size, ctime, mtime } = statResult;  // need to check on ios

        // Convert the size to a human-readable format
        const fileSizeInBytes = size;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;

        return {
            path: filePath,
            base64: `data:image/jpeg;base64,${base64}`,
            type: 'image/jpeg',
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


export async function compressImageFile(filePath, uploadCallback) {
    try {
        const compressedFilePath = await Image.compress(filePath, { compressionMethod: 'auto' });
        // Handle the compressed file
        const fileName = getFileName(compressedFilePath);
        const cacheDirectoryPath = RNFS.CachesDirectoryPath;
        const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
        const compressedFileDetails = await getFileDetails(filePathForCompressedFile);
        const fileDetails = { ...compressedFileDetails, fileName: getFileName(filePath) };

        if (fileDetails.sizeInKB <= 500) {
            uploadCallback?.(fileDetails, async () => {
                await deleteFile(filePathForCompressedFile);
            });
        } else {
            await deleteFile(filePathForCompressedFile);
        }
    } catch (error) {
        // Handle the error
        console.error(error);
    }
};