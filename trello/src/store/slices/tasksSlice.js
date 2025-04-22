import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (columnId, { rejectWithValue }) => {
    try {
      return await api.getTasks(columnId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      return await api.createTask(taskData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      return await api.updateTask(id, taskData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: {},
  status: "idle",
  error: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        const columnId = action.meta.arg;
        state.tasks[columnId] = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const columnId = action.payload.columnId;
        if (!state.tasks[columnId]) {
          state.tasks[columnId] = [];
        }
        state.tasks[columnId].push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const columnId = action.payload.columnId;
        if (state.tasks[columnId]) {
          const index = state.tasks[columnId].findIndex(
            (task) => task.id === action.payload.id
          );
          if (index !== -1) {
            state.tasks[columnId][index] = action.payload;
          }
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        for (const columnId in state.tasks) {
          state.tasks[columnId] = state.tasks[columnId].filter(
            (task) => task.id !== action.payload
          );
        }
      });
  },
});

export default tasksSlice.reducer;