import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosWithAuth from '#utils/axiosWithAuth';
import { normalize, schema } from 'normalizr';
import { setCurrentBatch } from '#reducers/batchSlice';


const initialState = {
    id: "",
    email: "",
    username: "",
    isLoggedIn: false,
    isPowerUser: false,
    annotators: {},
    annotatorIds: [],
    assignedbatches: [],
    loading: true,
    tab: 0
};

export const login = createAsyncThunk(
    'user/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axiosWithAuth.post(`/user/login/`, {
                email: email,
                password: password,
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const register = createAsyncThunk(
    'user/register',
    async ({ username, email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axiosWithAuth.post(`/user/register/`, {
                email: email,
                user_name: username,
                password: password,
            });
            return data;
        } catch (error) {
            return rejectWithValue("Failed to register the user, the email address might have already been registered.");
        }
    }
);

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (id) => {
        const { data } = await axiosWithAuth.get(`/user/${id}/`);
        return data;
    }
);

const userEntity = new schema.Entity('users');

export const fetchUserList = createAsyncThunk(
    'user/fetchUserList',
    async () => {
        const { data } = await axiosWithAuth.get('/user/');
        if (data.length === 0) return { users: {} };
        else {
            const annotators = data.filter(i => i.groups.includes("Annotator"));
            if (annotators.length === 0) return { users: {} };
            else {
                const { entities } = normalize(annotators, [userEntity]);
                return entities;
            }
        }
    }
);

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: () => initialState,
        switchTab: (state, action) => {
            state.tab = action.payload;
        }
    },
    extraReducers: {
        [login.fulfilled]: (state, action) => {

            const { id, email, user_name, refresh, access } = action.payload;
            state.id = id;
            state.email = email;
            state.username = user_name;
            state.isLoggedIn = true;

            localStorage.setItem("userId", id);
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            axiosWithAuth.defaults.headers["Authorization"] =
                "Bearer " + localStorage.getItem("access_token");

            state.loading = false;

        },
        [fetchUser.fulfilled]: (state, action) => {
            const { groups, batches, assigned_batches, id, email, user_name } = action.payload;
            if (groups.includes("Model Developer") || groups.includes("Admin")) {
                state.isPowerUser = true;
                state.assignedbatches = batches;
            } else if (groups.includes("Annotator")) {
                state.assignedbatches = assigned_batches;
            }
            state.id = id;
            state.email = email;
            state.username = user_name;
        },
        [fetchUserList.pending]: (state) => {
            state.loading = true;
        },
        [fetchUserList.fulfilled]: (state, action) => {
            state.annotators = action.payload.users;
            state.annotatorIds = Object.keys(action.payload.users);
            state.loading = false;
        },
        [setCurrentBatch]: (state) => {
            state.tab = 1;
        }

    }
});

export const { logout, switchTab } = userSlice.actions;

export default userSlice.reducer;
