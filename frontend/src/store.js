import { configureStore } from '@reduxjs/toolkit';
import userReducer from '#reducers/userSlice';
import batchReducer from '#reducers/batchSlice';
import fileReducer from '#reducers/fileSlice';
import segmentReducer from '#reducers/segmentSlice';
import annotationReducer from '#reducers/annotationSlice';
import errorReducer from '#reducers/errorSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        batch: batchReducer,
        file: fileReducer,
        segment: segmentReducer,
        annotation: annotationReducer,
        error: errorReducer,
    },
});
