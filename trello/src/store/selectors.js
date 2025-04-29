import { createSelector } from '@reduxjs/toolkit';

export const selectAllBoards = (state) => state.boards.boards;
export const selectCurrentBoard = (state) => state.boards.currentBoard;
export const selectBoardsStatus = (state) => state.boards.status;
export const selectBoardsError = (state) => state.boards.error;
export const selectBoardById = (state, boardId) => 
  state.boards.boards.find(board => board.id === boardId);

export const selectAllColumns = (state) => state.columns.columns;
export const selectColumnsStatus = (state) => state.columns.status;
export const selectColumnsError = (state) => state.columns.error;
export const selectColumnsByBoardId = (state, boardId) => 
  state.columns.columns.filter(column => column.boardId === boardId);
export const selectColumnById = (state, columnId) => 
  state.columns.columns.find(column => column.id === columnId);

const selectTasksState = (state) => state.tasks.tasks;
const selectColumnIdArg = (state, columnId) => columnId;

export const selectAllTasks = (state) => state.tasks.tasks; 

export const selectTasksByColumn = createSelector(
  [selectTasksState, selectColumnIdArg],
  (tasks, columnId) => tasks[columnId] || []
);

export const selectTasksStatus = (state) => state.tasks.status;
export const selectTasksError = (state) => state.tasks.error;

export const selectTaskById = (state, taskId) => {
  for (const columnId in state.tasks.tasks) {
    const task = state.tasks.tasks[columnId].find(task => task.id === taskId);
    if (task) return task;
  }
  return null;
};

const selectBoardIdArg = (state, boardId) => boardId;
const selectAllColumnsForBoard = createSelector(
  [selectAllColumns, selectBoardIdArg],
  (columns, boardId) => columns
    .filter(column => column.boardId === boardId)
    .sort((a, b) => a.order - b.order)
);

export const selectBoardWithColumnsAndTasks = createSelector(
  [
    (state, boardId) => selectBoardById(state, boardId) || selectCurrentBoard(state),
    selectAllColumnsForBoard,
    selectTasksState
  ],
  (board, columns, allTasks) => {
    if (!board) return null;

    const columnsWithTasks = columns.map(column => ({
      ...column,
      tasks: (allTasks[column.id] || []).sort((a, b) => a.order - b.order)
    }));

    return {
      ...board,
      columns: columnsWithTasks
    };
  }
);