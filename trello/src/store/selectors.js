import { createSelector } from '@reduxjs/toolkit'; // Добавьте импорт

// Селекторы для досок
export const selectAllBoards = (state) => state.boards.boards;
export const selectCurrentBoard = (state) => state.boards.currentBoard;
export const selectBoardsStatus = (state) => state.boards.status;
export const selectBoardsError = (state) => state.boards.error;
export const selectBoardById = (state, boardId) => 
  state.boards.boards.find(board => board.id === boardId);

// Селекторы для колонок
export const selectAllColumns = (state) => state.columns.columns;
export const selectColumnsStatus = (state) => state.columns.status;
export const selectColumnsError = (state) => state.columns.error;
export const selectColumnsByBoardId = (state, boardId) => 
  state.columns.columns.filter(column => column.boardId === boardId);
export const selectColumnById = (state, columnId) => 
  state.columns.columns.find(column => column.id === columnId);

// Селекторы для задач
const selectTasksState = (state) => state.tasks.tasks;
const selectColumnIdArg = (state, columnId) => columnId; // Селектор для получения второго аргумента

export const selectAllTasks = (state) => state.tasks.tasks; // Оставляем как есть, если не используется в useSelector напрямую с созданием нового массива/объекта

// Заменяем старый селектор на мемоизированный
export const selectTasksByColumn = createSelector(
  [selectTasksState, selectColumnIdArg], // Входные селекторы
  (tasks, columnId) => tasks[columnId] || [] // Функция-результат (будет вызвана только если tasks или columnId изменились)
);

export const selectTasksStatus = (state) => state.tasks.status;
export const selectTasksError = (state) => state.tasks.error;

// Селектор selectTaskById тоже может создавать новые объекты, но он ищет один элемент, 
// поэтому проблема менее вероятна. Если будут проблемы, его тоже можно мемоизировать.
export const selectTaskById = (state, taskId) => {
  // Ищем задачу по всем колонкам
  for (const columnId in state.tasks.tasks) {
    const task = state.tasks.tasks[columnId].find(task => task.id === taskId);
    if (task) return task;
  }
  return null;
};

// Комбинированные селекторы
// selectBoardWithColumnsAndTasks создает новый объект и массивы, его нужно мемоизировать!
const selectBoardIdArg = (state, boardId) => boardId;
const selectAllColumnsForBoard = createSelector(
  [selectAllColumns, selectBoardIdArg],
  (columns, boardId) => columns
    .filter(column => column.boardId === boardId)
    .sort((a, b) => a.order - b.order)
);

export const selectBoardWithColumnsAndTasks = createSelector(
  [
    (state, boardId) => selectBoardById(state, boardId) || selectCurrentBoard(state), // Используем существующие селекторы
    selectAllColumnsForBoard, // Используем мемоизированный селектор колонок
    selectTasksState // Используем базовый селектор задач
  ],
  (board, columns, allTasks) => { // Функция-результат
    if (!board) return null;

    const columnsWithTasks = columns.map(column => ({
      ...column,
      // Используем мемоизированный selectTasksByColumn внутри, передавая state и column.id
      // Но лучше напрямую использовать allTasks, которые уже переданы
      tasks: (allTasks[column.id] || []).sort((a, b) => a.order - b.order)
    }));

    return {
      ...board,
      columns: columnsWithTasks
    };
  }
);