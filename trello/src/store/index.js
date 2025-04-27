import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import columnsReducer from './slices/columnsSlice';
import tasksReducer from './slices/tasksSlice';
import authReducer from './slices/authSlice'; // Импорт нового редьюсера

const store = configureStore({
  reducer: {
    auth: authReducer, // Добавляем редьюсер аутентификации
    boards: boardsReducer,
    columns: columnsReducer,
    tasks: tasksReducer,
  },
});

export default store;