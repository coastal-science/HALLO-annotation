import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosWithAuth from '../utils/axiosWithAuth';
import { normalize, schema } from 'normalizr';

const initialState = {
    files: {},
    fileIds: [],
    fileNames: {},
    scanning: false,
    scanErrors: [],
    scanTotal: null,
    loading: false,
};

const fileEntity = new schema.Entity('files');

export const fetchFiles = createAsyncThunk(
    'file/fetchFiles',
    async (fileIds) => {
        const { data } = await axiosWithAuth.get(`/file/${fileIds ? "?id__in=" + fileIds.join(",") : ""}`);
        if (data.length === 0) return { files: {} };
        else {
            const { entities } = normalize(data, [fileEntity]);
            return entities;
        }
    }
);

//This is the action that was used for labeling files as included
//The feature is not being used for HALLO anymore but the code is here for future ref
export const moveFiles = createAsyncThunk(
    'file/includeFiles',
    async ({ ids, type }) => {
        const request = ids.map(id => {
            return axiosWithAuth.patch(`/file/${id}/`, { is_included: type === 'include' ? true : false });
        });
        const response = await Promise.all(request);
        return response.map(res => res.data);
    }
);

export const scanFiles = createAsyncThunk(
    'file/scanFiles',
    async () => {
        const { data } = await axiosWithAuth.get(`/file/scan/`);
        return data;
    }
);

export const deleteFiles = createAsyncThunk(
    'file/deleteFiles',
    async ({ ids }) => {
        const request = ids.map(id => {
            return axiosWithAuth.delete(`/file/${id}/`);
        });
        await Promise.all(request);
    }
);

export const fileSlice = createSlice({
    name: 'file',
    initialState,
    reducers: {
        check: (state, action) => {
            const id = action.payload;
            if (state.checked[id]) state.checked[id] = !state.checked[id];
            else state.checked[id] = true;
        },
        checkAll: (state, action) => {
            const { ids, checked } = action.payload;
            if (!checked) ids.forEach(id => {
                if (!state.checked[id]) state.checked[id] = true;
            });
            else ids.forEach(id => { state.checked[id] = false; });
        }
    },
    extraReducers: {
        [fetchFiles.pending]: (state) => {
            state.loading = true;
        },
        [fetchFiles.fulfilled]: (state, action) => {
            state.files = action.payload.files;
            state.fileIds = Object.keys(action.payload.files);
            for (const key in action.payload.files) {
                state.fileNames[action.payload.files[key].filename] = key;
            }
            state.loading = false;
        },

        [moveFiles.fulfilled]: (state, action) => {
            state.checked = {};
            action.payload.forEach(file => {
                state.files[file.id] = file;
            });
        },

        [scanFiles.pending]: (state) => {
            state.scanning = true;
        },

        [scanFiles.fulfilled]: (state, action) => {
            state.scanning = false;
            state.scanErrors = action.payload.errors;
            state.scanTotal = action.payload.files.length;
        },
    }
});

export const { check, checkAll, } = fileSlice.actions;

export default fileSlice.reducer;