import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mergedArr } from '../../utils/helper';
import { eventEmitter } from '../../event';
import { DBInstance } from '../../service/realm';

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

// export const insertMedia = (media) => (dispatch) => {
//     console.log("media", media)
//     // console.log("dispatch", dispatch);

//     // const data = mergedArr(oldArray, media);
//     // const dbMedia = DBInstance.objects('media');
//     // const dbMediaPath = dbMedia.map(m => m.fileUri);
//     // const filteredData = data.filter(i => !dbMediaPath.includes())

//     // const reminingUploadData = data.filter(media => !media.isUploaded);
//     // eventEmitter.emit('media', reminingUploadData)


//     // data.forEach(file => {
//     //     DBInstance.write(() => {
//     //         const newObject = {
//     //             id: `${file.timeStamp}`,
//     //             ...file
//     //         };

//     //         DBInstance.create('media', newObject);
//     //     })
//     // })


//     // dispatch(addMediaDetails(data));
// }

export const loadMediaFromDataBase = (callback) => dispatch => {
    const dbMedia = DBInstance.objects('media');
    dispatch(addMediaDetails(dbMedia));
    callback?.();
}