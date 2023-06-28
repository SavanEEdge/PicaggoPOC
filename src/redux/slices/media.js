import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { compressImageFile, convertUnixTimeSteamp, encodedData, generateFileName, getFileName, getMD5, mergedArr } from '../../utils/helper';
import { eventEmitter } from '../../event';
import { DBInstance } from '../../service/realm';
import reactotron from 'reactotron-react-native';

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
    console.log("assets", assets);
    const newMediaPath = assets.map(i => i.path);
    console.log("newMediaPath", newMediaPath);
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
    const dbMedia = DBInstance.objects('media');
    dbMedia.forEach(media => {

        if (media.isImage) {
            compressImageFile(media.uri, async (file, deleteFunction) => {
                const request_payload = {
                    md5: getMD5(file.fileName),
                    file_name: generateFileName(file.fileName, user.user.user_id, file.creationTime),
                    name: file.fileName,
                    event_id: event.event_id,
                    user_id: user.user.user_id,
                    mime_type: file.type,
                    path: file.path,
                    auto_collected: true,
                    file_date: `${convertUnixTimeSteamp(file.creationTime)}`,
                    bucket: aws.bucket,
                    image: file.base64,
                }
                try {

                    const rawRes = await fetch("https://sdrobz9xp1.execute-api.us-west-1.amazonaws.com/add_live_media_data", {
                        method: 'POST',
                        body: request_payload,
                        headers: {
                            Authorization: user.firebaseAuthToken?.trim(),
                        }
                    })
                    const res = await rawRes.json();
                    console.log("Response: ", res);
                } catch (e) {
                    console.log("Media Upload Error: ", e);
                }

                // reactotron.log("request_payload", request_payload)
                // const final_request = encodedData(request_payload);
                // console.log("--------------------------------------------------------------")
                // console.log("final_request", final_request)
                // const xhr = new XMLHttpRequest();
                // xhr.withCredentials = true;

                // xhr.addEventListener("readystatechange", function () {
                //     if (this.readyState === 4) {
                //         console.log(this.responseText);
                //     }
                // });

                // xhr.open("POST", "https://sdrobz9xp1.execute-api.us-west-1.amazonaws.com/add_live_media_data");
                // xhr.setRequestHeader("Authorization", user.firebaseAuthToken?.trim());
                // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                // xhr.send(final_request);
                await deleteFunction();
            });
        }
    });
    thunk.dispatch(addMediaDetails(dbMedia));
    callback?.();
});