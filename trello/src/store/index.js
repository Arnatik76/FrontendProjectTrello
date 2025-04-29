import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import columnsReducer from './slices/columnsSlice';
import tasksReducer from './slices/tasksSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer, 
    boards: boardsReducer,
    columns: columnsReducer,
    tasks: tasksReducer,
  },
});

export default store;