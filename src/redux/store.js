import { configureStore } from '@reduxjs/toolkit';
import user from './slices/user';
import loader from './slices/loader';

export const store = configureStore({
    reducer: {
        user,
        loader
    }
})