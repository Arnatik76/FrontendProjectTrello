import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchBoards = createAsyncThunk(
  "boards/fetchBoards",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getBoards();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  "boards/fetchBoardById",
  async (boardId, { rejectWithValue }) => {
    try {
      return await api.getBoard(boardId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBoard = createAsyncThunk(
  "boards/createBoard",
  async (boardData, { rejectWithValue }) => {
    try {
      return await api.createBoard(boardData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBoard = createAsyncThunk(
  "boards/updateBoard",
  async ({ id, boardData }, { rejectWithValue }) => {
    try {
      return await api.updateBoard(id, boardData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBoard = createAsyncThunk(
  "boards/deleteBoard",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteBoard(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.boards = action.payload;
        state.error = null;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchBoardById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentBoard = action.payload;
        state.error = null;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      })

      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex((board) => board.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && state.currentBoard.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
      })

      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((board) => board.id !== action.payload);
        if (state.currentBoard && state.currentBoard.id === action.payload) {
          state.currentBoard = null;
        }
      });
  },
});

export default boardsSlice.reducer;