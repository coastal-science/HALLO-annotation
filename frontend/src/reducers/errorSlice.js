import { createSlice } from "@reduxjs/toolkit";
import { addBatch, editBatch } from "./batchSlice";
import { login, register } from "./userSlice";


const initialState = {
    isAlertOpen: false,
    alertMessage: "",
    alertSeverity: 'info',
    alertTimer: 5000,
};

export const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        openAlert: (state, action) => {
            const { severity, message, timer } = action.payload;
            state.isAlertOpen = true;
            state.alertMessage = message;
            state.alertSeverity = severity;
            state.alertTimer = timer | 5000;
        },
        closeAlert: (state) => {
            state.isAlertOpen = false;
        }
    },
    extraReducers: {
        [login.rejected]: (state, action) => {
            state.isAlertOpen = true;
            state.alertMessage = action.payload.detail;
            state.alertSeverity = 'error';
            state.alertTimer = 3000;
        },
        [login.fulfilled]: (state, action) => {
            state.isAlertOpen = true;
            state.alertSeverity = 'success';
            state.alertMessage = "Welcome " + action.payload.user_name;
            state.alertTimer = 2000;
        },
        [register.rejected]: (state, action) => {
            state.isAlertOpen = true;
            state.alertMessage = action.payload;
            state.alertSeverity = 'error';
            state.alertTimer = 3000;
        },
        [addBatch.rejected]: (state, action) => {
            state.isAlertOpen = true;
            state.alertSeverity = 'error';
            state.alertTimer = 3000;
            state.alertMessage = action.error.message;
        },
        [editBatch.rejected]: (state, action) => {
            state.isAlertOpen = true;
            state.alertSeverity = 'error';
            state.alertTimer = 3000;
            state.alertMessage = action.error.message;
        },
    }
});

export const { openAlert, closeAlert } = errorSlice.actions;

export default errorSlice.reducer;
