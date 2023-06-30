import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { compressImageFile, convertUnixTimeSteamp, encodedData, generateFileName, getFileName, getMD5, mergedArr } from '../../utils/helper';
import { eventEmitter } from '../../event';
import { DBInstance } from '../../service/realm';
import reactotron from 'reactotron-react-native';
import api from '../../api';
import { getAWSClient } from '../../service/aws';
import { StorageService } from '../../service/storage_service';
import RNFS from 'react-native-fs';
import * as mime from 'react-native-mime-types';

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

export const loadMediaFromDataBase = createAsyncThunk('media/loadMedia', (callback, thunk) => {

    const user = thunk.getState().user;
    const event = thunk.getState().event;
    const aws = thunk.getState().aws;

    console.log("awsdetails ", aws);
    const client = getAWSClient();

    const dbMedia = DBInstance.objects('media');
    dbMedia.forEach(async (media) => {
        console.log("media", JSON.stringify(media, null, 2))
        const key = `events/${event.event_id}/originals/${media?.name}`;
        console.log("key", key);
        const isFileExists = await checkFileExists(key, client);
        // if (!isFileExists) {
        //     uploadImageToS3(media.uri, key, client);
        // } else {
        //     deleteFileFromS3(key, client)
        // }
        if (media.isImage) {
            // compressImageFile(media.uri, async (file, deleteFunction) => {
            //     const headers = {
            //         "Authorization": user.firebaseAuthToken?.trim()
            //     }
            //     const requestBody = {
            //         md5: getMD5(file.fileName),
            //         file_name: generateFileName(file.fileName, user.user.user_id, file.creationTime),
            //         name: file.fileName,
            //         event_id: event.event_id,
            //         user_id: user.user.user_id,
            //         mime_type: file.type,
            //         path: file.path,
            //         auto_collected: true,
            //         file_date: `${convertUnixTimeSteamp(file.creationTime)}`,
            //         bucket: aws.bucket,
            //         image: file.base64,
            //     };
            //     // console.log("requestBody", requestBody);
            //     reactotron.log("requestBody", requestBody)

            //     try {
            //         const response = await api.post("https://sdrobz9xp1.execute-api.us-west-1.amazonaws.com/add_live_media_data", requestBody, headers);
            //         if (response.status) {
            //             const data = parseJson(response.data);
            //             console.log("Media response", JSON.stringify(data, null, 2));
            //         }
            //     } catch (e) {
            //         console.log("Media Upload error: ", e);
            //     }
            //     await deleteFunction();
            // });
        }
    });
    thunk.dispatch(addMediaDetails(dbMedia));
    callback?.();
});

const checkFileExists = async (key, client) => {
    const awsDetails = StorageService.getValue("aws");
    const params = {
        Bucket: awsDetails?.bucket,
        Key: key,
    };

    try {
        const res = await client?.headObject(params).promise();
        console.log('File exists ', res);
        return true;
    } catch (error) {
        if (error.code === 'NotFound') {
            console.log('File does not exist');
            return false;
        } else {
            console.error('Error checking file existence:', error);
            throw error;
        }
    }
};

const deleteFileFromS3 = async (key, client) => {
    const awsDetails = StorageService.getValue("aws");
    const params = {
        Bucket: awsDetails?.bucket,
        Key: key,
    };

    try {
        const res = await client.deleteObject(params).promise();
        console.log('File deleted successfully ', res);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

const uploadImageToS3 = async (filePath, key, client) => {
    const awsDetails = StorageService.getValue("aws");
    const file = await RNFS.readFile(filePath, 'base64');
    const mime_type = mime.lookup(filePath);
    const file_name = getFileName(filePath) || 'photo.jpg';

    const params = {
        Bucket: awsDetails?.bucket,
        Key: key,
        // Body: file,
        Body: `data:image/jpeg;base64,${file}`,
    };

    try {
        const res = await client.upload(params).promise();
        console.log('Image uploaded successfully ', res);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
};