// filepath: c:\Users\Arnat\Documents\GitHub\FrontendProjectTrello\trello\src\store\slices\authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunk для регистрации
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.register(userData);
      return response; // Можно вернуть сообщение об успехе
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Thunk для входа
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const userData = await api.login(credentials);
      // Токен больше не сохраняется
      // localStorage.removeItem('token'); // Убедимся, что старого токена нет
      return userData; // Возвращаем данные пользователя
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Thunk для выхода
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.logout(); // Вызываем API для завершения сессии на бэке
      // Токен больше не удаляется из localStorage
      // localStorage.removeItem('token');
      // Диспатчим синхронный редьюсер для очистки состояния
      dispatch(authSlice.actions.logout());
    } catch (error) {
       // Ошибка при вызове API logout не должна мешать выходу на фронте
       console.error("Logout failed but proceeding with frontend logout:", error);
       dispatch(authSlice.actions.logout()); // Все равно выходим на фронте
       // return rejectWithValue(error); // Не отклоняем, чтобы не показывать ошибку пользователю
    }
  }
);


// Thunk для проверки текущей сессии
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    // Токен больше не проверяется в localStorage
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   return rejectWithValue('No token found');
    // }
    try {
      // Запрос полагается на cookie сессии
      const userData = await api.getCurrentUser();
      return userData;
    } catch (error) {
      // Если сессии нет или она невалидна, api.getCurrentUser вернет ошибку (например, 401)
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Синхронный редьюсер для выхода (вызывается из logoutUser thunk)
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'; state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded'; // Регистрация успешна, но пользователь еще не вошел
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'; state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'; state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = 'failed';
        // Не обязательно сохранять ошибку 'No session'
        // state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout thunk (только для обработки статуса pending/rejected, если нужно)
      .addCase(logoutUser.pending, (state) => {
         // Можно установить статус loading, но очистка происходит синхронно
         // state.status = 'loading';
      });
      // fulfilled/rejected обрабатываются через dispatch(logout())
  },
});

export const { logout } = authSlice.actions; // Экспортируем синхронный logout
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;