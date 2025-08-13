import { configureStore } from '@reduxjs/toolkit';
import picReducer from '../features/pics/picSlice';

export const store = configureStore({
  reducer: {
    pic: picReducer
  },
});

