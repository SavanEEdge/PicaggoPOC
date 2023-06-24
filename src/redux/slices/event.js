import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        addEventDetails(state, action) {
            Object.assign(state, action.payload);
        }
    }
});

export const { addEventDetails } = eventSlice.actions;
export default eventSlice.reducer;