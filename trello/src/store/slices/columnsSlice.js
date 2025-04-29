import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchColumns = createAsyncThunk('columns/fetchColumns', async (boardId, { rejectWithValue }) => {
  try {
    return await api.getColumns(boardId);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch columns');
  }
});

export const createColumn = createAsyncThunk('columns/createColumn', async (columnData, { rejectWithValue }) => {
  try {
    return await api.createColumn(columnData);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to create column');
  }
});

export const updateColumn = createAsyncThunk('columns/updateColumn', async ({ id, columnData }, { rejectWithValue }) => {
  try {
    return await api.updateColumn(id, columnData);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update column');
  }
});

export const deleteColumn = createAsyncThunk('columns/deleteColumn', async (columnId, { rejectWithValue }) => {
  try {
    await api.deleteColumn(columnId);
    return columnId;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to delete column');
  }
});

export const persistColumnOrder = createAsyncThunk(
  'columns/persistOrder',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const columns = state.columns.columns;
    
    if (!columns || columns.length === 0) {
      return;
    }
    
    try {
      const updatePromises = columns.map((column, index) => 
        api.updateColumn(column.id, { ...column, order: index })
      );
      
      await Promise.all(updatePromises);
      return columns;
    } catch (error) {
      console.error("Failed to persist column order:", error);
      return rejectWithValue(error.message || 'Failed to save column order');
    }
  }
);

const initialState = {
  columns: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    reorderColumnOptimistic: (state, action) => {
      const { draggedId, hoveredId } = action.payload;
      const dragIndex = state.columns.findIndex(column => column.id === draggedId);
      const hoverIndex = state.columns.findIndex(column => column.id === hoveredId);
      
      if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) {
        return; 
      }
      
      const [draggedColumn] = state.columns.splice(dragIndex, 1);
      
      state.columns.splice(hoverIndex, 0, draggedColumn);
      
      state.columns.forEach((column, index) => {
        column.order = index;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchColumns
      .addCase(fetchColumns.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.columns = action.payload.sort((a, b) => a.order - b.order);
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // createColumn
      .addCase(createColumn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.columns.push(action.payload);
        state.columns.sort((a, b) => a.order - b.order);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // updateColumn
      .addCase(updateColumn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.columns.findIndex(col => col.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
          state.columns.sort((a, b) => a.order - b.order);
        }
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // deleteColumn
      .addCase(deleteColumn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.columns = state.columns.filter(col => col.id !== action.payload);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // persistColumnOrder
      .addCase(persistColumnOrder.pending, (state) => {
      })
      .addCase(persistColumnOrder.fulfilled, (state) => {
        console.log("Column order persisted successfully");
      })
      .addCase(persistColumnOrder.rejected, (state, action) => {
        state.error = action.payload;
        console.error("Error persisting column order:", action.payload);
      });
  },
});

export const { reorderColumnOptimistic } = columnsSlice.actions;
export default columnsSlice.reducer;