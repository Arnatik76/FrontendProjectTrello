import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
// Import deleteColumn from columnsSlice
import { fetchColumns, deleteColumn } from './columnsSlice';

export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAllTasks',
  async (boardId, { getState, dispatch, rejectWithValue }) => {
    try {
      await dispatch(fetchColumns(boardId)).unwrap();
      const columns = getState().columns.columns;
      const taskPromises = columns.map(column => api.getTasks(column.id));
      const tasksResults = await Promise.all(taskPromises);

      const tasksByColumn = {};
      columns.forEach((column, index) => {
        tasksByColumn[column.id] = tasksResults[index].sort((a, b) => a.order - b.order);
      });
      return tasksByColumn;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tasks for the board');
    }
  }
);

export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    return await api.createTask(taskData);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, taskData }, { rejectWithValue }) => {
  try {
    return await api.updateTask(id, taskData);
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    await api.deleteTask(taskId);
    return taskId;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to delete task');
  }
});

const initialState = {
  tasks: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAllTasks
      .addCase(fetchAllTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // createTask
      .addCase(createTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const task = action.payload;
        if (!state.tasks[task.columnId]) {
          state.tasks[task.columnId] = [];
        }
        state.tasks[task.columnId].push(task);
        state.tasks[task.columnId].sort((a, b) => a.order - b.order);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedTask = action.payload;
        if (state.tasks[updatedTask.columnId]) {
          const index = state.tasks[updatedTask.columnId].findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            state.tasks[updatedTask.columnId][index] = updatedTask;
            state.tasks[updatedTask.columnId].sort((a, b) => a.order - b.order);
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const taskId = action.payload;
        for (const columnId in state.tasks) {
          state.tasks[columnId] = state.tasks[columnId].filter(task => task.id !== taskId);
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle column deletion: Remove tasks associated with the deleted column
      .addCase(deleteColumn.fulfilled, (state, action) => {
         const columnId = action.payload;
         delete state.tasks[columnId];
      });
  },
});

export default tasksSlice.reducer;