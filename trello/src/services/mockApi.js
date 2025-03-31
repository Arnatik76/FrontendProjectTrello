// Initial mock data
const mockData = {
  boards: [
    { id: 1, name: "Доска 1" },
    { id: 2, name: "Доска 2" },
  ],
  columns: [
    { id: 1, boardId: 1, title: "To Do", order: 1 },
    { id: 2, boardId: 1, title: "In Progress", order: 2 },
    { id: 3, boardId: 1, title: "Done", order: 3 },
    { id: 4, boardId: 2, title: "To Do", order: 1 },
    { id: 5, boardId: 2, title: "In Progress", order: 2 },
  ],
  tasks: [
    { id: 1, columnId: 1, content: "Task 1", order: 1 },
    { id: 2, columnId: 1, content: "Task 2", order: 2 },
    { id: 3, columnId: 1, content: "Task 3", order: 3 },
    { id: 4, columnId: 2, content: "Task 4", order: 1 },
    { id: 5, columnId: 2, content: "Task 5", order: 2 },
    { id: 6, columnId: 3, content: "Task 6", order: 1 },
    { id: 7, columnId: 4, content: "Board 2 - Task 1", order: 1 },
    { id: 8, columnId: 5, content: "Board 2 - Task 2", order: 1 },
  ],
};

// Mock API methods
const mockApi = {
  // Board operations
  getBoards: async () => {
    return [...mockData.boards];
  },
  
  getBoard: async (id) => {
    const board = mockData.boards.find((b) => b.id === parseInt(id));
    if (!board) throw new Error("Board not found");
    return { ...board };
  },
  
  createBoard: async (boardData) => {
    const newBoard = {
      id: Date.now(),
      ...boardData,
    };
    mockData.boards.push(newBoard);
    return { ...newBoard };
  },
  
  updateBoard: async (id, boardData) => {
    const index = mockData.boards.findIndex((b) => b.id === parseInt(id));
    if (index === -1) throw new Error("Board not found");
    mockData.boards[index] = { ...mockData.boards[index], ...boardData };
    return { ...mockData.boards[index] };
  },
  
  deleteBoard: async (id) => {
    const index = mockData.boards.findIndex((b) => b.id === parseInt(id));
    if (index === -1) throw new Error("Board not found");
    mockData.boards.splice(index, 1);
    
    // Cleanup related columns and tasks
    const columnsToRemove = mockData.columns.filter((c) => c.boardId === parseInt(id));
    columnsToRemove.forEach((column) => {
      mockData.tasks = mockData.tasks.filter((t) => t.columnId !== column.id);
    });
    mockData.columns = mockData.columns.filter((c) => c.boardId !== parseInt(id));
    
    return { success: true };
  },
  
  // Column operations
  getColumns: async (boardId) => {
    return mockData.columns
      .filter((c) => c.boardId === parseInt(boardId))
      .map((c) => ({ ...c }));
  },
  
  createColumn: async (columnData) => {
    const newColumn = {
      id: Date.now(),
      ...columnData,
    };
    mockData.columns.push(newColumn);
    return { ...newColumn };
  },
  
  updateColumn: async (id, columnData) => {
    const index = mockData.columns.findIndex((c) => c.id === parseInt(id));
    if (index === -1) throw new Error("Column not found");
    mockData.columns[index] = { ...mockData.columns[index], ...columnData };
    return { ...mockData.columns[index] };
  },
  
  deleteColumn: async (id) => {
    const index = mockData.columns.findIndex((c) => c.id === parseInt(id));
    if (index === -1) throw new Error("Column not found");
    mockData.columns.splice(index, 1);
    
    // Remove related tasks
    mockData.tasks = mockData.tasks.filter((t) => t.columnId !== parseInt(id));
    
    return { success: true };
  },
  
  // Task operations
  getTasks: async (columnId) => {
    return mockData.tasks
      .filter((t) => t.columnId === parseInt(columnId))
      .map((t) => ({ ...t }));
  },
  
  createTask: async (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
    };
    mockData.tasks.push(newTask);
    return { ...newTask };
  },
  
  updateTask: async (id, taskData) => {
    const index = mockData.tasks.findIndex((t) => t.id === parseInt(id));
    if (index === -1) throw new Error("Task not found");
    mockData.tasks[index] = { ...mockData.tasks[index], ...taskData };
    return { ...mockData.tasks[index] };
  },
  
  moveTask: async (taskId, newColumnId, newOrder) => {
    const index = mockData.tasks.findIndex((t) => t.id === parseInt(taskId));
    if (index === -1) throw new Error("Task not found");
    
    mockData.tasks[index] = { 
      ...mockData.tasks[index], 
      columnId: parseInt(newColumnId), 
      order: newOrder 
    };
    
    return { ...mockData.tasks[index] };
  },
  
  deleteTask: async (id) => {
    const index = mockData.tasks.findIndex((t) => t.id === parseInt(id));
    if (index === -1) throw new Error("Task not found");
    mockData.tasks.splice(index, 1);
    return { success: true };
  },
  
  // Get complete board data including columns and tasks
  getBoardData: async (boardId) => {
    const board = mockData.boards.find((b) => b.id === parseInt(boardId));
    if (!board) throw new Error("Board not found");
    
    const columns = mockData.columns
      .filter((c) => c.boardId === parseInt(boardId))
      .map((column) => {
        const tasks = mockData.tasks
          .filter((t) => t.columnId === column.id)
          .sort((a, b) => a.order - b.order);
        
        return {
          ...column,
          tasks: tasks.map(t => ({...t})),
        };
      })
      .sort((a, b) => a.order - b.order);
    
    return {
      ...board,
      columns,
    };
  },
};

export default mockApi;