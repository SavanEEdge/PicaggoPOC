import { createSlice } from '@reduxjs/toolkit';
import { mergedArr } from '../../utils/helper';

const initialState = {
    assets: []
};

const mediaSlice = createSlice({
    name: 'media',
    initialState,
    reducers: {
        addMediaDetails(state, action) {
            state.assets = mergedArr(state.assets, action.payload);
        }
    }
});

export const { addMediaDetails } = mediaSlice.actions;
export default mediaSlice.reducer;