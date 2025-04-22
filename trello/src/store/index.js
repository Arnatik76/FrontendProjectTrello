import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './reducers/boardReducer';
import columnReducer from './reducers/columnReducer';
import taskReducer from './reducers/taskReducer';

const store = configureStore({
  reducer: {
    boards: boardReducer,
    columns: columnReducer,
    tasks: taskReducer,
  },
});

export default store;