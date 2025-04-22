import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchColumns, 
  createColumn, 
  updateColumn, 
  deleteColumn 
} from "../slices/columnsSlice";

const initialState = {
  columns: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  boardId: null
};

const columnsSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {
    clearColumnError: (state) => {
      state.error = null;
    },
    resetColumnState: (state) => {
      return { ...initialState, boardId: state.boardId };
    },
    setCurrentBoardId: (state, action) => {
      state.boardId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColumns.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.columns = action.payload;
        state.boardId = action.meta.arg;
        state.error = null;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(createColumn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.columns.push(action.payload);
        state.error = null;
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(updateColumn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.columns.findIndex((column) => column.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(deleteColumn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.columns = state.columns.filter((column) => column.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(reorderColumns.pending, (state) => {
        state.status = "loading";
      })
      .addCase(reorderColumns.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.columns = action.payload;
        state.error = null;
      })
      .addCase(reorderColumns.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearColumnError, resetColumnState, setCurrentBoardId } = columnsSlice.actions;
export default columnsSlice.reducer;