import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchBoards, 
  fetchBoardById, 
  createBoard, 
  updateBoard, 
  deleteBoard 
} from "../slices/boardsSlice";

const initialState = {
  boards: [],
  currentBoard: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    resetBoardState: () => initialState
  },
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
      
      .addCase(createBoard.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.boards.push(action.payload);
        state.error = null;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(updateBoard.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.boards.findIndex((board) => board.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        
        if (state.currentBoard && state.currentBoard.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(deleteBoard.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.boards = state.boards.filter((board) => board.id !== action.payload);
        
        if (state.currentBoard && state.currentBoard.id === action.payload) {
          state.currentBoard = null;
        }
        
        state.error = null;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearBoardError, resetBoardState } = boardsSlice.actions;
export default boardsSlice.reducer;