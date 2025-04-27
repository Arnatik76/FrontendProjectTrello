import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import columnsReducer from './slices/columnsSlice';
import tasksReducer from './slices/tasksSlice';

const store = configureStore({
  reducer: {
    boards: boardsReducer,
    columns: columnsReducer,
    tasks: tasksReducer,
  },
});

export default store;