import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { compressImageFile, compressVideoFile, convertUnixTimeSteamp, deleteFile, encodedData, generateFileName, getBase64, getFileName, getMD5, getVideoThumbnail, mergedArr } from '../../utils/helper';
import { eventEmitter } from '../../event';
import { DBInstance } from '../../service/realm';
import reactotron from 'reactotron-react-native';
import api from '../../api';
import { checkFileExists, deleteFileFromS3, getAWSClient } from '../../service/aws';
import { StorageService } from '../../service/storage_service';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import * as mime from 'react-native-mime-types';
import { Worker } from '../../service/queue';

const initialState = {
    assets: []
};

const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        addMediaDetails(state, action) {
            state.assets = action.payload;
        }
    }
});

export const { addMediaDetails } = mediaSlice.actions;
export default mediaSlice.reducer;


export const insertMedia = createAsyncThunk('media/insertMedia', (param = [], thunk) => {
    const assets = thunk.getState().media.assets;
    // console.log("assets", assets);
    const newMediaPath = assets.map(i => i.path);
    // console.log("newMediaPath", newMediaPath);
    const newMedia = param.filter(i => !newMediaPath.includes(i.path));

    newMedia.forEach(async (media) => {
        DBInstance.write(() => {
            const newObject = {
                id: `${media.timeStamp}`,
                ...media
            };

            DBInstance.create('media', newObject);
        });

        if (media.isImage && !media.isUploaded) {
            // await uploadImage(media, user, event, aws);
        } else if (!media.isImage && !media.isUploaded) {
            await uploadVideo(media, user, event, aws);
        }
    });
    if (newMedia?.length > 0) {
        eventEmitter.emit('media', newMedia);
    }
});

export const loadMediaFromDataBase = createAsyncThunk('media/loadMedia', async (callback, thunk) => {

    const user = thunk.getState().user;
    const event = thunk.getState().event;
    const aws = StorageService.getValue("aws");


    const dbMedia = DBInstance.objects('media');
    dbMedia.forEach(async (media) => {
        if (media.isImage && !media.isUploaded) {
            // await uploadImage(media, user, event, aws);
        } else if (!media.isImage && !media.isUploaded) {
            await uploadVideo(media, user, event, aws);
        }
    });
    thunk.dispatch(addMediaDetails(dbMedia));
    callback?.();
});


export async function uploadVideo(media, user, event, aws) {
    const orignal_key = `events/${event.event_id}/originals/${media?.name}`;
    checkFileExists(orignal_key);
    return;
    const compressedVideoFile = await compressVideoFile(media.uri);
    const thumbnail = await getVideoThumbnail(media.uri);
    if (Boolean(thumbnail && compressedVideoFile)) {
        const { compressedFileDetails, orignalFileDetails } = compressedVideoFile;
        const fileName = getFileName(compressedFileDetails.path);
        const cacheDirectoryPath = RNFS.CachesDirectoryPath;
        const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
        const generatedFileName = generateFileName(fileName, user.user.user_id, compressedFileDetails.creationTime)
        const headers = {
            "Authorization": user.firebaseAuthToken?.trim()
        }
        const requestBody = {
            id: media.id,
            md5: await getMD5(filePathForCompressedFile),
            file_name: generatedFileName,
            name: fileName,
            event_id: event.event_id,
            user_id: user.user.user_id,
            mime_type: 'video/mp4',
            path: compressedFileDetails.path,
            auto_collected: true,
            file_date: `${convertUnixTimeSteamp(compressedFileDetails.creationTime)}`,
            bucket: aws.bucket,
            image: await getBase64(thumbnail.path),
        };


        Worker.addJob(Worker.UPLOAD_SERVER, { requestBody, headers, filePath: thumbnail.path });

        // upload compress file
        const compress_key = `events/${event.event_id}/compressed/${generatedFileName}`;
        Worker.addJob(Worker.UPLOAD_S3, { path: filePathForCompressedFile, key: compress_key, id: media.id });

        // upload orignal file
        const orignal_key = `events/${event.event_id}/originals/${media?.name}`;
        Worker.addJob(Worker.UPLOAD_S3, { path: orignalFileDetails.path, key: orignal_key, id: media.id });
        deleteFile(thumbnail.path);
    }
}

export async function uploadImage(media, user, event, aws) {
    const compressedImage = await compressImageFile(media.uri);
    if (compressedImage) {
        const { compressedFileDetails, orignalFileDetails } = compressedImage;
        const compressFile = compressedFileDetails;
        if (compressFile) {
            const fileName = getFileName(compressFile.path);
            const cacheDirectoryPath = RNFS.CachesDirectoryPath;
            const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
            const headers = {
                "Authorization": user.firebaseAuthToken?.trim()
            }
            const requestBody = {
                id: media.id,
                md5: await getMD5(filePathForCompressedFile),
                file_name: generateFileName(fileName, user.user.user_id, compressFile.creationTime),
                name: compressFile.fileName,
                event_id: event.event_id,
                user_id: user.user.user_id,
                mime_type: compressFile.type,
                path: compressFile.path,
                auto_collected: true,
                file_date: `${convertUnixTimeSteamp(compressFile.creationTime)}`,
                bucket: aws.bucket,
                image: compressFile.base64,
            };

            Worker.addJob(Worker.UPLOAD_SERVER, { requestBody, headers, filePath: filePathForCompressedFile });
            deleteFile(filePathForCompressedFile);
        }
        if (orignalFileDetails) {
            const key = `events/${event.event_id}/originals/${media?.name}`;
            Worker.addJob(Worker.UPLOAD_S3, { path: media.uri, key, id: media.id });
        }
    }
}