import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchColumns = createAsyncThunk(
  "columns/fetchColumns",
  async (boardId, { rejectWithValue }) => {
    try {
      return await api.getColumns(boardId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createColumn = createAsyncThunk(
  "columns/createColumn",
  async (columnData, { rejectWithValue }) => {
    try {
      return await api.createColumn(columnData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateColumn = createAsyncThunk(
  "columns/updateColumn",
  async ({ id, columnData }, { rejectWithValue }) => {
    try {
      return await api.updateColumn(id, columnData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteColumn = createAsyncThunk(
  "columns/deleteColumn",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteColumn(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  columns: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const columnsSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchColumns.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.columns = action.payload;
        state.error = null;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex((column) => column.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter((column) => column.id !== action.payload);
      });
  },
});

export default columnsSlice.reducer;