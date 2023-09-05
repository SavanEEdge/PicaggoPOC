import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const awsSlice = createSlice({
    name: 'aws',
    initialState,
    reducers: {
        addDetails(state, action) {
            Object.assign(state, action.payload);
        }
    }
});

export const { addDetails } = awsSlice.actions;
export default awsSlice.reducer;