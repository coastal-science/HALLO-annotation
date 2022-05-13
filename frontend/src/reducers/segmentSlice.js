import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosWithAuth, { backendURL } from '.././utils/axiosWithAuth';
import { normalize, schema } from 'normalizr';

const initialState = {
    segments: {},
    segmentIds: [],
    checked: [],
    selectAll: false,
    loading: false
};

const segmentEntity = new schema.Entity('segments');

export const fetchSegments = createAsyncThunk(
    'segment/fetchSegments',
    async () => {
        const { data } = await axiosWithAuth.get('/segment/');
        if (data.length === 0) return { segments: {} };
        else {
            const normalized = normalize(data, [segmentEntity]);
            return normalized.entities;
        }
    }
);

export const addSegments = createAsyncThunk(
    'segment/addSegments',
    async ({ durations }) => {
        const { data } = await axiosWithAuth.post('/segment/', durations);
        return data;
    }
);

export const removeSegments = createAsyncThunk(
    'segment/removeSegments',
    async ({ checked }) => {
        const ids = checked;
        await axiosWithAuth.delete(`/segment/delete/?ids=${ids.join(",")}`);
        // const requests = ids.map(id => {
        //     return axiosWithAuth.delete(`/segment/${id}/`);
        // });
        // await Promise.all(requests);
    }
);

export const addSegmentsToBatches = createAsyncThunk(
    'segment/addSegmentsToBatches',
    async ({ checkedBatchIds, checkedSegmentIds, batches }) => {
        const requests = checkedBatchIds.map(batchId => {
            const currentSegments = batches[batchId].segments;
            return axiosWithAuth.patch(`/batch/${batchId}/`, { segments: [...new Set([...currentSegments, ...checkedSegmentIds])] });
        });
        await Promise.all(requests);
    }
);

export const fetchAudio = createAsyncThunk(
    'segment/fetchAudio',
    async (settings) => {
        const { data } = await axiosWithAuth({
            method: "get",
            url: "/hallo/audio/",
            params: settings,
        });
        return data;
    }
);

export const segmentSlice = createSlice({
    name: 'segment',
    initialState,
    reducers: {
        handleSelect: (state, action) => {
            state.checked = action.payload;
        }
    },
    extraReducers: {
        [fetchSegments.fulfilled]: (state, action) => {
            state.segments = action.payload.segments;
            state.segmentIds = Object.keys(action.payload.segments);
        },
        [addSegments.pending]: (state) => {
            state.loading = true;
        },
        [addSegments.fulfilled]: (state) => {
            state.loading = false;
        },
        [addSegments.rejected]: (state, action) => {
            console.log(action.error);
        },
        [removeSegments.pending]: (state) => {
            state.loading = true;
        },
        [removeSegments.fulfilled]: (state) => {
            state.loading = false;
            state.checked = [];
        },
        [addSegmentsToBatches.fulfilled]: (state) => {
            state.checked = [];
        },
        [fetchAudio.fulfilled]: (state, action) => {
            const segment = action.payload;
            state.segments[segment.id] = { ...segment, audio: backendURL + segment.audio };
        }
    }
});

export const { handleSelect } = segmentSlice.actions;

export default segmentSlice.reducer;
