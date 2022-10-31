import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosWithAuth from "#utils/axiosWithAuth";
import { normalize, schema } from "normalizr";


const initialState = {
  batchIds: [],
  batches: {},
  currentBatch: "",
  batchLoading: true,
  images: {},
  imageIds: [],
};

const batchEntity = new schema.Entity("batches");


export const fetchBatchesByIds = createAsyncThunk(
  "batch/fetchBatchesByIds",
  async (batches) => {
    if (batches.length === 0) return { batches: {} };
    else {
      const { data } = await axiosWithAuth.get(`/batch/?id__in=${batches.join(",")}`);
      const normalized = normalize(data, [batchEntity]);
      return normalized.entities;
    }
  }
);


export const addBatch = createAsyncThunk(
  "batch/addBatch",
  async ({ settings, selectedAnnotators, annotatorIds, annotators }) => {
    const { data } = await axiosWithAuth.post("/batch/", settings);
    const batchId = data.id;
    const requests = annotatorIds.map(id => {
      if (selectedAnnotators[id]) {
        return axiosWithAuth
          .patch(`/user/${id}/`, { assigned_batches: [...annotators[id].assigned_batches, batchId] });
      } else return null;
    });
    await Promise.all(requests);
    return { data };
  }
);

export const editBatch = createAsyncThunk(
  "batch/editBatch",
  async ({ settings, selectedAnnotators, annotatorIds, annotators }) => {
    const { data } = await axiosWithAuth.put(`/batch/${settings.id}/`, settings);
    const batchId = data.id;
    const requests = annotatorIds.map(id => {
      const assigned_batches = annotators[id].assigned_batches;
      if (selectedAnnotators[id]) {
        return axiosWithAuth
          .patch(`/user/${id}/`, { assigned_batches: [...new Set([...assigned_batches, batchId])] });
      }
      else {
        const removedId = assigned_batches.indexOf(batchId);
        if (removedId > -1) {
          const updatedAnnotation = [...assigned_batches];
          updatedAnnotation.splice(removedId, 1);
          return axiosWithAuth
            .patch(`/user/${id}/`, { assigned_batches: updatedAnnotation });
        } else return null;
      }
    });
    await Promise.all(requests);
    return { data };
  }
);

export const updateBatchSegments = createAsyncThunk(
  "batch/updateBatchSegments",
  async ({ segments, batchId }) => {
    const { data } = await axiosWithAuth.patch(`/batch/${batchId}/`, { segments });
    return data;
  }
);

export const deleteBatch = createAsyncThunk(
  "batch/deleteBatch",
  async (id) => {
    await axiosWithAuth.delete(`/batch/${id}/`);
    return id;
  }
);

export const fetchProgress = createAsyncThunk(
  "batch/fetchProgress",
  async ({ batchId, userId }) => {
    const { data } = await axiosWithAuth.get(`/user/progress/?batch=${batchId}&annotator=${userId}&is_completed=${true}`);
    return { data, batchId, userId };
  }
);


export const batchSlice = createSlice({
  name: "batch",
  initialState,
  reducers: {
    setCurrentBatch: (state, action) => {
      state.currentBatch = action.payload;
    }
  },
  extraReducers: {
    [fetchBatchesByIds.fulfilled]: (state, action) => {
      state.batches = action.payload.batches;
      state.batchIds = Object.keys(action.payload.batches);
      state.batchLoading = false;
    },
    [addBatch.fulfilled]: (state, action) => {
      state.batchIds.push(action.payload.data.id);
      state.batches[action.payload.data.id] = action.payload.data;
    },
    [editBatch.fulfilled]: (state, action) => {
      state.batches[action.payload.data.id] = action.payload.data;
    },
    [updateBatchSegments.fulfilled]: (state, action) => {
      state.batches[action.payload.id] = action.payload;
    },
  }
});

export const { setCurrentBatch } = batchSlice.actions;

export default batchSlice.reducer;
