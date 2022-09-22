import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosWithAuth from '.././utils/axiosWithAuth';
import { normalize, schema } from 'normalizr';
import { annotationToRegion } from '../utils/annotationUtils';
import { queryFormater } from '../utils/segmentUtils';

const initialState = {
    annotations: {},
    annotationIds: [],
    checked: {},
    selectAll: false,
    region: null,
    regionCopy: null,
    isDrawing: false,
    isSelected: false,
    annotation: null,
    annotationHistory: null,
    currentAnnotations: {},
    currentAnnotationIds: [],
    currentRegions: {},
    currentRegionIds: [],
    copyOfEditRegion: null,
    progressMap: {},
    progressMapLoading: true,
    selectedRegion: null,
    pending: false,
};

const annotationEntity = new schema.Entity('annotations');
const currentAnnotationEntity = new schema.Entity('currentAnnotations');

export const fetchAnnotationsByBatches = createAsyncThunk(
    'annotation/fetchAnnotationss',
    async (batches) => {
        if (batches.length === 0) return { annotations: {} };
        else {
            const { data } = await axiosWithAuth.get(`/annotation/?batch__in=${batches.join(",")}`);
            if (data.length === 0) return { annotations: {} };
            const { entities } = normalize(data, [annotationEntity]);
            return entities;
        }
    }
);

export const saveAnnotation = createAsyncThunk(
    'annotation/saveAnnotation',
    async (annotation) => {
        const { data } = await axiosWithAuth.post(`/annotation/`, annotation);
        return data;
    }
);

export const updateAnnotation = createAsyncThunk(
    'annotation/updateAnnotation',
    async ({ id, formData }) => {
        const { data } = await axiosWithAuth.put(`/annotation/${id}/`, formData);
        return data;
    }
);

export const deleteAnnotation = createAsyncThunk(
    'annotation/delete',
    async ({ ids }) => {
        queryFormater(ids).forEach(sub => axiosWithAuth.delete(`/annotation/delete/?ids=${sub.join(",")}`));
        return ids;
    }
);

export const fetchCurrentAnnotations = createAsyncThunk(
    'annotation/fetchCurrentAnnotations',
    async ({ batchId, segmentId, annotator }) => {
        const { data } = await axiosWithAuth
            .get(`/annotation/?batch=${batchId}&segment=${segmentId}&annotator=${annotator}`);
        if (data.length === 0) return { currentAnnotations: {} };
        else {
            const { entities } = normalize(data, [currentAnnotationEntity]);
            return entities;
        }
    }
);

export const fetchBatchProgress = createAsyncThunk(
    'annotation/fetchBatchProgress',
    async ({ batchId, userId }) => {
        const { data } = await axiosWithAuth.get(`/user/progress/?batch=${batchId}&annotator=${userId}`);
        return data;
    }
);

export const addProgress = createAsyncThunk(
    `annotation/addProgress`,
    async ({ batchId, segmentId, userId }, { rejectWithValue }) => {
        try {
            const { data } = await axiosWithAuth.post(`/user/progress/`, {
                name: `batch_${batchId}_segment_${segmentId}_annotator_${userId}`,
                batch: batchId,
                segment: segmentId,
                annotator: userId,
                is_completed: true,
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }

    }
);

export const markAsNotCompleted = createAsyncThunk(
    `annotation/markAsNotCompleted`,
    async ({ progressId, isCompleted }) => {
        const { data } = await axiosWithAuth.patch(`/user/progress/${progressId}/`, { is_completed: isCompleted });

        return data;
    }
);
export const markAsMarked = createAsyncThunk(
    `annotation/markAsNotCompleted`,
    async ({ progressId, isMarked }) => {
        const { data } = await axiosWithAuth.patch(`/user/progress/${progressId}/`, { is_marked: isMarked });
        return data;
    }
);

export const addBatchAnnotations = createAsyncThunk(
    `annotation/addBatchAnnotations`,
    async (annotations) => {
        const { data } = await axiosWithAuth.post(`/annotation/create/`, annotations);
        return data;
    }
);

export const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        mouseDown: (state, action) => {
            state.isDrawing = true;
            const point = action.payload;
            state.region = {
                id: "New",
                x: point.x,
                y: point.y,
                width: 0,
                height: 0,
                name: "region",
                stroke: "white",
            };
        },
        mouseMove: (state, action) => {
            const point = action.payload;
            state.region.width = Math.abs(state.region.x - point.x);
            state.region.height = Math.abs(state.region.y - point.y);
        },
        mouseUp: (state) => {
            state.isDrawing = false;
            if (state.region.width === 0 || state.region.width === 0) {
                state.region = null;
                state.annotation = null;
            }
        },
        regionChange: (state, action) => {
            state.region = action.payload;
        },
        currentRegionChange: (state, action) => {
            const { id } = action.payload;
            state.currentRegions[id] = action.payload;
        },
        selectRegion: (state) => {
            state.isSelected = true;
        },
        convertRegionToAnnotation: (state, action) => {
            state.annotation = action.payload;
        },
        convertAnnotationsToRegions: (state, action) => {
            const {
                currentAnnotations,
                ...rest
            } = action.payload;

            state.currentRegions = {};
            state.currentRegionIds = [];

            for (const key in currentAnnotations) {
                const annotation = currentAnnotations[key];
                const region = annotationToRegion({ annotation, ...rest });
                state.currentRegions[key] = region;
                state.currentRegionIds.push(key);
            }
        },
        clearRegion: (state) => {
            state.region = null;
            state.annotation = null;
        },
        editAnnotation: (state, action) => {
            const annotationId = action.payload;
            state.selectedRegion = annotationId;
            state.copyOfEditRegion = { ...state.currentRegions[annotationId] };
        },
        cancelEditAnnotation: (state, action) => {
            state.selectedRegion = null;
            state.currentRegions[action.payload] = { ...state.copyOfEditRegion };
            state.copyOfEditRegion = null;
        },
        cleanProgressMap: (state) => {
            state.progressMap = {};
        },
        setProgressLoading: (state) => {
            state.progressMapLoading = true;
        },
        clearHistory: (state) => {
            state.annotationHistory = null;
        }
    },
    extraReducers: {
        [fetchAnnotationsByBatches.fulfilled]: (state, action) => {
            state.annotations = action.payload.annotations;
            state.annotationIds = Object.keys(action.payload.annotations);
        },
        [saveAnnotation.fulfilled]: (state, action) => {
            state.currentAnnotations[action.payload.id] = action.payload;
            state.currentAnnotationIds.push(action.payload.id);
            state.annotation = null;
            state.region = null;
            state.annotationHistory = action.payload;
        },
        [updateAnnotation.fulfilled]: (state, action) => {
            const updatedAnnotation = action.payload;
            state.currentAnnotations[updatedAnnotation.id] = updatedAnnotation;
        },
        [deleteAnnotation.pending]: (state) => {
            state.pending = true;
        },
        [deleteAnnotation.fulfilled]: (state, action) => {
            const ids = action.payload;
            state.annotationIds = state.annotationIds.filter(id => !ids.includes(+id));
            state.selectedRegion = null;
            state.pending = false;
        },
        [fetchCurrentAnnotations.pending]: (state, action) => {
            state.pending = true;
        },
        [fetchCurrentAnnotations.fulfilled]: (state, action) => {
            state.currentAnnotations = action.payload.currentAnnotations;
            state.currentAnnotationIds = Object.keys(action.payload.currentAnnotations);
            state.selectedRegion = null;
            state.pending = false;
        },
        [fetchBatchProgress.pending]: (state) => {
            state.progressMapLoading = true;
        },
        [fetchBatchProgress.fulfilled]: (state, action) => {
            action.payload.forEach(progress => {
                const { id, segment, is_completed, is_marked } = progress;
                state.progressMap[segment] = { is_completed, is_marked, progressId: id };
            });
            state.progressMapLoading = false;
        },
        [addProgress.fulfilled]: (state, action) => {
            const { id, segment, is_completed, is_marked } = action.payload;
            state.progressMap[segment] = { is_completed, is_marked, progressId: id };
        },
        [markAsMarked.fulfilled]: (state, action) => {
            const { id, segment, is_completed, is_marked } = action.payload;
            state.progressMap[segment] = { is_completed, is_marked, progressId: id };
        },
    }
});



export const {
    mouseDown,
    mouseMove,
    mouseUp,
    regionChange,
    selectRegion,
    clearRegion,
    clearHistory,
    convertRegionToAnnotation,
    convertAnnotationsToRegions,
    editAnnotation,
    cancelEditAnnotation,
    currentRegionChange,
    cleanProgressMap,
    setProgressLoading,
} = annotationSlice.actions;

export default annotationSlice.reducer;

