import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { compressImageFile, compressVideoFile, convertUnixTimeSteamp, deleteFile, encodedData, generateFileName, getBase64, getFileName, getMD5, getVideoThumbnail, mergedArr } from '../../utils/helper';
import { eventEmitter } from '../../event';
import { DBInstance } from '../../service/realm';
import reactotron from 'reactotron-react-native';
import api from '../../api';
import { getAWSClient } from '../../service/aws';
import { StorageService } from '../../service/storage_service';
import RNFS from 'react-native-fs';
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

    newMedia.forEach(file => {
        DBInstance.write(() => {
            const newObject = {
                id: `${file.timeStamp}`,
                ...file
            };

            DBInstance.create('media', newObject);
        })
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
            // const compressedImage = await compressImageFile(media.uri);
            // if (compressedImage) {
            //     const { compressedFileDetails, orignalFileDetails } = compressedImage;
            //     const compressFile = compressedFileDetails;
            //     if (compressFile) {
            //         const fileName = getFileName(compressFile.path);
            //         const cacheDirectoryPath = RNFS.CachesDirectoryPath;
            //         const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
            //         const headers = {
            //             "Authorization": user.firebaseAuthToken?.trim()
            //         }
            //         const requestBody = {
            //             id: media.id,
            //             md5: await getMD5(filePathForCompressedFile),
            //             file_name: generateFileName(fileName, user.user.user_id, compressFile.creationTime),
            //             name: compressFile.fileName,
            //             event_id: event.event_id,
            //             user_id: user.user.user_id,
            //             mime_type: compressFile.type,
            //             path: compressFile.path,
            //             auto_collected: true,
            //             file_date: `${convertUnixTimeSteamp(compressFile.creationTime)}`,
            //             bucket: aws.bucket,
            //             image: compressFile.base64,
            //         };

            //         Worker.addJob(Worker.UPLOAD_SERVER, { requestBody, headers });
            //         deleteFile(filePathForCompressedFile);
            //     }
            //     if (orignalFileDetails) {
            //         const key = `events/${event.event_id}/originals/${media?.name}`;
            //         Worker.addJob(Worker.UPLOAD_IMAGE_S3, { path: media.uri, key });
            //     }
            // }

        } else {
            const compressedVideoFile = await compressVideoFile(media.uri);
            const thumbnail = await getVideoThumbnail(media.uri);
            // console.log("compressedVideoFile", compressedVideoFile);
            // console.log("thumbnail", thumbnail);
            if (Boolean(thumbnail && compressedVideoFile)) {
                const { compressedFileDetails, orignalFileDetails } = compressedVideoFile;
                console.log("compressedFileDetails", compressedFileDetails);
                const fileName = getFileName(compressedFileDetails.path);
                const cacheDirectoryPath = RNFS.CachesDirectoryPath;
                const filePathForCompressedFile = `${cacheDirectoryPath}/${fileName}`;
                const generatedFileName = generateFileName(fileName, user.user.user_id, compressedFileDetails.creationTime)
                console.log("compressedFileDetails", compressedFileDetails);
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


                Worker.addJob(Worker.UPLOAD_SERVER, { requestBody, headers });

                // upload compress file
                const compress_key = `events/${event.event_id}/compressed/${generatedFileName}`;
                Worker.addJob(Worker.UPLOAD_VIDEO_S3, { path: filePathForCompressedFile, key: compress_key });

                // upload orignal file
                const orignal_key = `events/${event.event_id}/originals/${media?.name}`;
                Worker.addJob(Worker.UPLOAD_VIDEO_S3, { path: orignalFileDetails.path, key: orignal_key });
                deleteFile(thumbnail.path);
            }
            // const key = `events/${event.event_id}/originals/${media?.name}`;
            // Worker.addJob(Worker.UPLOAD_VIDEO_S3, { path: media.uri, key });
        }
    });
    thunk.dispatch(addMediaDetails(dbMedia));
    callback?.();
});
