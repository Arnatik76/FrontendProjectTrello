// Boards
export const selectAllBoards = (state) => state.boards.boards;
export const selectCurrentBoard = (state) => state.boards.currentBoard;
export const selectBoardsStatus = (state) => state.boards.status;
export const selectBoardsError = (state) => state.boards.error;
export const selectBoardById = (state, boardId) => 
  state.boards.boards.find(board => board.id === boardId);

// Columns
export const selectAllColumns = (state) => state.columns.columns;
export const selectColumnsStatus = (state) => state.columns.status;
export const selectColumnsError = (state) => state.columns.error;
export const selectColumnsByBoardId = (state, boardId) => 
  state.columns.columns.filter(column => column.boardId === boardId);
export const selectColumnById = (state, columnId) => 
  state.columns.columns.find(column => column.id === columnId);

// Tasks
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTasksByColumn = (state, columnId) => 
  state.tasks.tasks[columnId] || [];
export const selectTasksStatus = (state) => state.tasks.status;
export const selectTasksError = (state) => state.tasks.error;
export const selectTaskById = (state, taskId) => {
  for (const columnId in state.tasks.tasks) {
    const task = state.tasks.tasks[columnId].find(task => task.id === taskId);
    if (task) return task;
  }
  return null;
};

export const selectBoardWithColumnsAndTasks = (state, boardId) => {
  const board = selectBoardById(state, boardId) || selectCurrentBoard(state);
  if (!board) return null;
  
  const columns = selectAllColumns(state)
    .filter(column => column.boardId === board.id)
    .sort((a, b) => a.order - b.order);
  
  const columnsWithTasks = columns.map(column => ({
    ...column,
    tasks: selectTasksByColumn(state, column.id).sort((a, b) => a.order - b.order)
  }));
  
  return {
    ...board,
    columns: columnsWithTasks
  };
};