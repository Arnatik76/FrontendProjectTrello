import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchTasks, 
  fetchAllTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  moveTask 
} from "../slices/tasksSlice";

const initialState = {
  tasks: {},
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    resetTaskState: () => initialState
  },
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
      
      .addCase(fetchAllTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(createTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        const columnId = action.payload.columnId;
        
        if (!state.tasks[columnId]) {
          state.tasks[columnId] = [];
        }
        
        state.tasks[columnId].push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(updateTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        const columnId = action.payload.columnId;
        
        if (state.tasks[columnId]) {
          const index = state.tasks[columnId].findIndex(
            (task) => task.id === action.payload.id
          );
          if (index !== -1) {
            state.tasks[columnId][index] = action.payload;
          }
        }
        
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(deleteTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        for (const columnId in state.tasks) {
          state.tasks[columnId] = state.tasks[columnId].filter(
            (task) => task.id !== action.payload
          );
        }
        
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(moveTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        const { task, sourceColumnId, destinationColumnId } = action.payload;
        
        if (state.tasks[sourceColumnId]) {
          state.tasks[sourceColumnId] = state.tasks[sourceColumnId].filter(
            (t) => t.id !== task.id
          );
        }
        
        if (!state.tasks[destinationColumnId]) {
          state.tasks[destinationColumnId] = [];
        }
        
        state.tasks[destinationColumnId].push(task);
        state.tasks[destinationColumnId].sort((a, b) => a.order - b.order);
        
        state.error = null;
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearTaskError, resetTaskState } = tasksSlice.actions;
export default tasksSlice.reducer;