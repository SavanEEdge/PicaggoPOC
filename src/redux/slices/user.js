import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    googleToken: '',
    firebaseAuthToken: '',
    googleUser: null,
    firebaseUser: null,
    user: null,
    verificationId: '',
    resolver: () => { },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateInformation(state, action) {
            Object.assign(state, action.payload);
        },
        logout(state) {
            Object.assign(state, initialState);
        }
    }
});

export const { logout, updateInformation } = userSlice.actions;
export default userSlice.reducer;