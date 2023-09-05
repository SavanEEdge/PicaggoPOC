import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    text: 'Loading...'
};

const loaderSlice = createSlice({
    name: 'loader',
    initialState,
    reducers: {
        toggleLoader(state, action) {
            state.isLoading = action.payload.isLoading;
            state.text = action.payload.text;
        }
    }
});

export const { toggleLoader } = loaderSlice.actions;
export default loaderSlice.reducer;