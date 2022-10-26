import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosWithAuth from '#utils/axiosWithAuth';
import { normalize, schema } from 'normalizr';
import { queryFormater } from '#utils/segmentUtils';

const initialState = {
    segments: {},
    segmentIds: [],
    checked: [],
    selectAll: false,
    loading: false
};

const segmentEntity = new schema.Entity('segments');

export const fetchSegmentsByIds = createAsyncThunk(
    'segment/fetchSegments',
    async (segmentIds) => {
        if (segmentIds.length === 0) return { segments: {} };
        else {
            const { data } = await axiosWithAuth.get(`/segment/?id__in=${segmentIds.join(",")}`);
            const normalized = normalize(data, [segmentEntity]);
            return normalized.entities;
        }

    }
);

export const fetchSegmentsByCreater = createAsyncThunk(
    'segment/fetchSegments',
    async (model_developer) => {
        const { data } = await axiosWithAuth.get(`/segment/?model_developer=${model_developer}`);
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
        const normalized = normalize(data, [segmentEntity]);
        return normalized.entities;
    }
);

export const updateSegment = createAsyncThunk(
    'segment/updateSegment',
    async ({ end, segmentId }) => {
        const { data } = await axiosWithAuth.patch(`/segment/${segmentId}/`, { end });
        return data;
    }
);

export const removeSegments = createAsyncThunk(
    'segment/removeSegments',
    async ({ checked }) => {
        const ids = checked;
        queryFormater(ids).forEach(sub => axiosWithAuth.delete(`/segment/delete/?ids=${sub.join(",")}`));
        return ids;
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

export const segmentSlice = createSlice({
    name: 'segment',
    initialState,
    reducers: {
        handleSelect: (state, action) => {
            state.checked = action.payload;
        }
    },
    extraReducers: {

        [fetchSegmentsByCreater.pending]: (state, action) => {
            state.loading = true;
        },
        [fetchSegmentsByCreater.fulfilled]: (state, action) => {
            state.loading = false;
            state.segments = action.payload.segments;
            state.segmentIds = Object.keys(action.payload.segments);
        },
        [addSegments.pending]: (state) => {
            state.loading = true;
        },
        [addSegments.fulfilled]: (state, action) => {
            state.loading = false;
            state.segments = { ...action.payload.segments, ...state.segments };
            state.segmentIds = [...Object.keys(action.payload.segments), ...state.segmentIds];
        },
        [addSegments.rejected]: (state, action) => {
            console.log(action.error);
        },
        [removeSegments.pending]: (state) => {
            state.loading = true;
        },
        [removeSegments.fulfilled]: (state, action) => {
            const ids = action.payload;
            state.segmentIds = state.segmentIds.filter(id => !ids.includes(+id));
            state.loading = false;
            state.checked = [];
        },
        [addSegmentsToBatches.fulfilled]: (state) => {
            state.loading = false;
            state.checked = [];
        },
    }
});

export const { handleSelect } = segmentSlice.actions;

export default segmentSlice.reducer;
