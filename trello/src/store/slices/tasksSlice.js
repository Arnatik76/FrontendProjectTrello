import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { fetchColumns, deleteColumn } from './columnsSlice';
import { selectTaskById, selectTasksByColumn } from '../selectors';

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

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ taskId, targetColumnId, order }, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const task = selectTaskById(state, taskId);

    if (!task) {
      return rejectWithValue('Task not found');
    }

    dispatch(tasksSlice.actions.updateTaskOptimistic({
      taskId,
      sourceColumnId: task.columnId,
      targetColumnId,
      order,
    }));

    try {
      const updatedTaskData = { ...task, columnId: targetColumnId, order };
      await api.updateTask(taskId, updatedTaskData);
      // return updatedTaskData;
      return { taskId, targetColumnId, order }; 
    } catch (error) {
      dispatch(tasksSlice.actions.revertTaskMove({
        taskId,
        originalColumnId: task.columnId,
        targetColumnId,
        originalOrder: task.order,
      }));
      return rejectWithValue(error.message || 'Failed to move task');
    }
  }
);

export const persistTaskOrderInColumn = createAsyncThunk(
  'tasks/persistOrder',
  async (columnId, { getState, rejectWithValue }) => {
    const state = getState();
    const tasksInColumn = selectTasksByColumn(state, columnId);

    if (!tasksInColumn || tasksInColumn.length === 0) {
      return;
    }

    try {
      const updatePromises = tasksInColumn.map((task, index) =>
        api.updateTask(task.id, { ...task, order: index })
      );
      await Promise.all(updatePromises);
      return columnId;
    } catch (error) {
      console.error("Failed to persist task order:", error);
      return rejectWithValue(error.message || 'Failed to save task order');
    }
  }
);

const initialState = {
  tasks: {},
  status: 'idle',
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reorderTaskOptimistic: (state, action) => {
      const { columnId, draggedId, hoveredId } = action.payload;
      const tasksInColumn = state.tasks[columnId];

      if (!tasksInColumn) return; 

      const dragIndex = tasksInColumn.findIndex(t => t.id === draggedId);
      const hoverIndex = tasksInColumn.findIndex(t => t.id === hoveredId);

      if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) {
        return;
      }

      const [draggedTask] = tasksInColumn.splice(dragIndex, 1);

      tasksInColumn.splice(hoverIndex, 0, draggedTask);

      tasksInColumn.forEach((task, index) => {
        task.order = index;
      });
    },

    updateTaskOptimistic: (state, action) => {
      const { taskId, sourceColumnId, targetColumnId, order } = action.payload;
      const taskIndex = state.tasks[sourceColumnId]?.findIndex(t => t.id === taskId);

      if (taskIndex !== -1) {
        const [taskToMove] = state.tasks[sourceColumnId].splice(taskIndex, 1);

        taskToMove.columnId = targetColumnId;
        taskToMove.order = order; 

        if (!state.tasks[targetColumnId]) {
          state.tasks[targetColumnId] = [];
        }
        state.tasks[targetColumnId].push(taskToMove);
        state.tasks[targetColumnId].sort((a, b) => a.order - b.order);

        if (state.tasks[sourceColumnId]) {
           state.tasks[sourceColumnId].forEach((t, index) => t.order = index);
        }
        state.tasks[targetColumnId].forEach((t, index) => t.order = index);

      }
    },
    revertTaskMove: (state, action) => {
      const { taskId, originalColumnId, targetColumnId, originalOrder } = action.payload;
      const taskIndex = state.tasks[targetColumnId]?.findIndex(t => t.id === taskId);

      if (taskIndex !== -1) {
        const [taskToRevert] = state.tasks[targetColumnId].splice(taskIndex, 1);

        taskToRevert.columnId = originalColumnId;
        taskToRevert.order = originalOrder;

        if (!state.tasks[originalColumnId]) {
          state.tasks[originalColumnId] = [];
        }
        state.tasks[originalColumnId].push(taskToRevert);
        state.tasks[originalColumnId].sort((a, b) => a.order - b.order);

        if (state.tasks[targetColumnId]) {
           state.tasks[targetColumnId].forEach((t, index) => t.order = index);
        }
        if (state.tasks[originalColumnId]) {
           state.tasks[originalColumnId].forEach((t, index) => t.order = index);
        }
      }
    }
  },
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
      .addCase(deleteColumn.fulfilled, (state, action) => {
         const columnId = action.payload;
         delete state.tasks[columnId];
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        action.payload.forEach(column => {
          if (!state.tasks[column.id]) {
            state.tasks[column.id] = [];
          }
        });
      })
      .addCase(persistTaskOrderInColumn.pending, (state) => {
        // state.status = 'loading';
      })
      .addCase(persistTaskOrderInColumn.fulfilled, (state, action) => {
        // state.status = 'succeeded';
        console.log(`Task order persisted for column ${action.payload}`);
      })
      .addCase(persistTaskOrderInColumn.rejected, (state, action) => {
        // state.status = 'failed';
        state.error = action.payload;
        console.error("Error persisting task order:", action.payload);
      });
  },
});

export const { reorderTaskOptimistic, updateTaskOptimistic, revertTaskMove } = tasksSlice.actions;

export default tasksSlice.reducer;