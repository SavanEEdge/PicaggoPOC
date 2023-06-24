import { configureStore } from '@reduxjs/toolkit';
import user from './slices/user';
import loader from './slices/loader';
import event from './slices/event';
import aws from './slices/aws';

export const store = configureStore({
    reducer: {
        user,
        loader,
        event,
        aws
    }
})