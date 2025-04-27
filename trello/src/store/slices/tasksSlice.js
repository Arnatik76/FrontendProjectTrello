import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { fetchColumns, deleteColumn } from './columnsSlice';
import { selectTaskById, selectTasksByColumn } from '../selectors'; // Убедитесь, что селекторы импортированы

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

// Новый async thunk для перемещения задачи
export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ taskId, targetColumnId, order }, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const task = selectTaskById(state, taskId); // Используем селектор для получения задачи

    if (!task) {
      return rejectWithValue('Task not found');
    }

    // Оптимистичное обновление UI
    dispatch(tasksSlice.actions.updateTaskOptimistic({
      taskId,
      sourceColumnId: task.columnId,
      targetColumnId,
      order,
    }));

    try {
      // Вызываем API для обновления задачи на сервере
      const updatedTaskData = { ...task, columnId: targetColumnId, order };
      await api.updateTask(taskId, updatedTaskData);
      // Если нужно, можно вернуть обновленную задачу с сервера
      // return updatedTaskData; // Возвращаем данные для fulfilled
      return { taskId, targetColumnId, order }; // Возвращаем достаточно данных для редьюсера
    } catch (error) {
      // Откатываем оптимистичное обновление в случае ошибки API
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

// --- ДОБАВИТЬ ЭТОТ THUNK ---
export const persistTaskOrderInColumn = createAsyncThunk(
  'tasks/persistOrder',
  async (columnId, { getState, rejectWithValue }) => {
    const state = getState();
    // Получаем актуальный порядок задач ПОСЛЕ оптимистичного обновления
    const tasksInColumn = selectTasksByColumn(state, columnId);

    if (!tasksInColumn || tasksInColumn.length === 0) {
      return; // Нечего сохранять
    }

    try {
      // Создаем массив промисов для обновления каждой задачи
      const updatePromises = tasksInColumn.map((task, index) =>
        // Отправляем обновленный order для каждой задачи
        // Убедитесь, что ваш API ожидает 'order' в теле запроса
        api.updateTask(task.id, { ...task, order: index })
      );
      // Дожидаемся выполнения всех запросов
      await Promise.all(updatePromises);
      // Возвращаем ID колонки для возможной доп. логики в fulfilled
      return columnId;
    } catch (error) {
      // TODO: Рассмотреть откат оптимистичного обновления при ошибке
      console.error("Failed to persist task order:", error);
      return rejectWithValue(error.message || 'Failed to save task order');
    }
  }
);
// --- КОНЕЦ ДОБАВЛЕННОГО THUNK ---

const initialState = {
  tasks: {},
  status: 'idle',
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // --- ДОБАВИТЬ ЭТОТ РЕДЬЮСЕР ---
    reorderTaskOptimistic: (state, action) => {
      const { columnId, draggedId, hoveredId } = action.payload;
      const tasksInColumn = state.tasks[columnId];

      if (!tasksInColumn) return; // Колонки нет

      const dragIndex = tasksInColumn.findIndex(t => t.id === draggedId);
      const hoverIndex = tasksInColumn.findIndex(t => t.id === hoveredId);

      // Если один из элементов не найден или индексы совпадают, ничего не делаем
      if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) {
        return;
      }

      // 1. Удаляем перетаскиваемый элемент из массива
      const [draggedTask] = tasksInColumn.splice(dragIndex, 1);

      // 2. Вставляем его на место элемента, над которым он находится
      tasksInColumn.splice(hoverIndex, 0, draggedTask);

      // 3. Обновляем 'order' для всех задач в этой колонке на основе их нового индекса
      tasksInColumn.forEach((task, index) => {
        task.order = index;
      });
    },
    // --- КОНЕЦ ДОБАВЛЕННОГО РЕДЬЮСЕРА ---

    updateTaskOptimistic: (state, action) => {
      const { taskId, sourceColumnId, targetColumnId, order } = action.payload;
      const taskIndex = state.tasks[sourceColumnId]?.findIndex(t => t.id === taskId);

      if (taskIndex !== -1) {
        // Удаляем из старой колонки
        const [taskToMove] = state.tasks[sourceColumnId].splice(taskIndex, 1);

        // Обновляем данные задачи
        taskToMove.columnId = targetColumnId;
        taskToMove.order = order; // Используем переданный порядок

        // Добавляем в новую колонку (или ту же самую)
        if (!state.tasks[targetColumnId]) {
          state.tasks[targetColumnId] = [];
        }
        // Вставляем в нужную позицию (или просто добавляем и сортируем)
        // Простой вариант: добавить и отсортировать
        state.tasks[targetColumnId].push(taskToMove);
        state.tasks[targetColumnId].sort((a, b) => a.order - b.order);

        // Пересчитываем order для колонки, ИЗ которой ушла задача (если нужно)
        if (state.tasks[sourceColumnId]) {
           state.tasks[sourceColumnId].forEach((t, index) => t.order = index);
        }
        // Пересчитываем order для колонки, В которую пришла задача
        state.tasks[targetColumnId].forEach((t, index) => t.order = index);

      }
    },
    // Редьюсер для отката оптимистичного обновления
    revertTaskMove: (state, action) => {
      const { taskId, originalColumnId, targetColumnId, originalOrder } = action.payload;
      const taskIndex = state.tasks[targetColumnId]?.findIndex(t => t.id === taskId);

      if (taskIndex !== -1) {
        // Удаляем из целевой колонки
        const [taskToRevert] = state.tasks[targetColumnId].splice(taskIndex, 1);

        // Возвращаем старые данные
        taskToRevert.columnId = originalColumnId;
        taskToRevert.order = originalOrder;

        // Возвращаем в исходную колонку
        if (!state.tasks[originalColumnId]) {
          state.tasks[originalColumnId] = [];
        }
        state.tasks[originalColumnId].push(taskToRevert);
        state.tasks[originalColumnId].sort((a, b) => a.order - b.order);

        // Пересчитываем order (если нужно)
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
      // Handle column deletion: Remove tasks associated with the deleted column
      .addCase(deleteColumn.fulfilled, (state, action) => {
         const columnId = action.payload;
         delete state.tasks[columnId];
      })
      // Добавим обработчик для fetchColumns, чтобы инициализировать пустые массивы
      .addCase(fetchColumns.fulfilled, (state, action) => {
        action.payload.forEach(column => {
          if (!state.tasks[column.id]) {
            state.tasks[column.id] = [];
          }
        });
      })
      // --- ДОБАВИТЬ ОБРАБОТЧИКИ ДЛЯ НОВОГО THUNK ---
      .addCase(persistTaskOrderInColumn.pending, (state) => {
        // Можно установить статус 'loading', если нужно показать индикатор
        // state.status = 'loading';
      })
      .addCase(persistTaskOrderInColumn.fulfilled, (state, action) => {
        // Порядок успешно сохранен на сервере
        // state.status = 'succeeded';
        console.log(`Task order persisted for column ${action.payload}`);
      })
      .addCase(persistTaskOrderInColumn.rejected, (state, action) => {
        // Ошибка сохранения порядка
        // state.status = 'failed';
        state.error = action.payload;
        // Здесь можно было бы откатить оптимистичное обновление,
        // но это усложнит логику. Пока просто логируем ошибку.
        console.error("Error persisting task order:", action.payload);
      });
      // --- КОНЕЦ ДОБАВЛЕННЫХ ОБРАБОТЧИКОВ ---
  },
});

// --- ДОБАВИТЬ ЭКСПОРТ ДЕЙСТВИЙ ---
export const { reorderTaskOptimistic, updateTaskOptimistic, revertTaskMove } = tasksSlice.actions;
// --- КОНЕЦ ДОБАВЛЕННОГО ЭКСПОРТА ---

export default tasksSlice.reducer;