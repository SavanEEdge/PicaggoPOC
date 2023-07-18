import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import user from './slices/user';
import loader from './slices/loader';
import event from './slices/event';
import aws from './slices/aws';
import media from './slices/media';
import reactotron from '../utils/ReactotronConfig';

export const store = configureStore({
  reducer: {
    user,
    loader,
    event,
    aws,
    media,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  enhancers: [reactotron.createEnhancer()],
});
