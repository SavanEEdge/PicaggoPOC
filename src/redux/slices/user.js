import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    googleToken: '',
    firebaseAuthToken: '',
    googleUser: null,
    firebaseUser: null,
    user: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action) {
            state.isLoggedIn = true;
            state.googleToken = action.payload.googleToken;
            state.firebaseAuthToken = action.payload.firebaseAuthToken;
            state.googleUser = action.payload.googleUser;
            state.firebaseUser = action.payload.firebaseUser;
            state.user = action.payload.user;
        },
        updateInformation(state, action) {
            Object.assign(state, action.payload);
        },
        logout(state) {
            Object.assign(state,initialState);
        }
    }
});

export const { login, logout, updateInformation } = userSlice.actions;
export default userSlice.reducer;