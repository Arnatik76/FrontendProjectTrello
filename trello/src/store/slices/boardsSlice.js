import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBoards = createAsyncThunk('boards/fetchBoards', async (_, { rejectWithValue }) => {
  try {
    return await api.getBoards();
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch boards');
  }
});

export const fetchBoardById = createAsyncThunk('boards/fetchBoardById', async (boardId, { rejectWithValue }) => {
  try {
    return await api.getBoard(boardId);
  } catch (error) {
    return rejectWithValue(error.message || `Failed to fetch board ${boardId}`);
  }
});

export const createBoard = createAsyncThunk('boards/createBoard', async (boardData, { rejectWithValue }) => {
  try {
    return await api.createBoard(boardData);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to create board');
  }
});

export const updateBoard = createAsyncThunk('boards/updateBoard', async ({ id, boardData }, { rejectWithValue }) => {
  try {
    return await api.updateBoard(id, boardData);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update board');
  }
});

export const deleteBoard = createAsyncThunk('boards/deleteBoard', async (boardId, { rejectWithValue }) => {
  try {
    await api.deleteBoard(boardId);
    return boardId;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to delete board');
  }
});

const initialState = {
  boards: [],
  currentBoard: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchBoards
      .addCase(fetchBoards.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // fetchBoardById
      .addCase(fetchBoardById.pending, (state) => {
        state.status = 'loading';
        state.currentBoard = null;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // createBoard
      .addCase(createBoard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // updateBoard
      .addCase(updateBoard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.boards.findIndex(board => board.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // deleteBoard
      .addCase(deleteBoard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.boards = state.boards.filter(board => board.id !== action.payload);
        if (state.currentBoard?.id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default boardsSlice.reducer;