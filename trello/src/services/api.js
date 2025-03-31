import axios from "axios";
import mockApi from "./mockApi";

// Flag to determine if we should use mock API or real API
const USE_MOCK_API = false;

// Create axios instance for real API
const apiClient = axios.create({
  baseURL: "http://localhost:8080", // Replace with actual API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// API methods that will use either mock API or real API
const api = {
  // Board operations
  getBoards: async () => {
    if (USE_MOCK_API) {
      return mockApi.getBoards();
    }
    const response = await apiClient.get("/boards");
    return response.data;
  },
  
  getBoard: async (id) => {
    if (USE_MOCK_API) {
      return mockApi.getBoard(id);
    }
    const response = await apiClient.get(`/boards/${id}`);
    return response.data;
  },
  
  createBoard: async (boardData) => {
    if (USE_MOCK_API) {
      return mockApi.createBoard(boardData);
    }
    const response = await apiClient.post("/boards", boardData);
    return response.data;
  },
  
  updateBoard: async (id, boardData) => {
    if (USE_MOCK_API) {
      return mockApi.updateBoard(id, boardData);
    }
    const response = await apiClient.put(`/boards/${id}`, boardData);
    return response.data;
  },
  
  deleteBoard: async (id) => {
    if (USE_MOCK_API) {
      return mockApi.deleteBoard(id);
    }
    const response = await apiClient.delete(`/boards/${id}`);
    return response.data;
  },
  
  // Column operations
  getColumns: async (boardId) => {
    if (USE_MOCK_API) {
      return mockApi.getColumns(boardId);
    }
    const response = await apiClient.get(`/boards/${boardId}/columns`);
    return response.data;
  },
  
  createColumn: async (columnData) => {
    if (USE_MOCK_API) {
      return mockApi.createColumn(columnData);
    }
    const response = await apiClient.post("/columns", columnData);
    return response.data;
  },
  
  updateColumn: async (id, columnData) => {
    if (USE_MOCK_API) {
      return mockApi.updateColumn(id, columnData);
    }
    const response = await apiClient.put(`/columns/${id}`, columnData);
    return response.data;
  },
  
  deleteColumn: async (id) => {
    if (USE_MOCK_API) {
      return mockApi.deleteColumn(id);
    }
    const response = await apiClient.delete(`/columns/${id}`);
    return response.data;
  },
  
  // Task operations
  getTasks: async (columnId) => {
    if (USE_MOCK_API) {
      return mockApi.getTasks(columnId);
    }
    const response = await apiClient.get(`/columns/${columnId}/tasks`);
    return response.data;
  },
  
  createTask: async (taskData) => {
    if (USE_MOCK_API) {
      return mockApi.createTask(taskData);
    }
    
    // Возможно проблема в формате данных - Spring Boot ожидает другую структуру
    // Пробуем разные варианты именования полей
    const payload = {
      columnId: parseInt(taskData.columnId),
      content: taskData.content,
      order: taskData.order
    };
    
    console.log("Отправляемые данные для создания задачи:", payload);
    
    const response = await apiClient.post("/tasks", payload);
    return response.data;
  },
  
  updateTask: async (id, taskData) => {
    if (USE_MOCK_API) {
      return mockApi.updateTask(id, taskData);
    }
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  moveTask: async (taskId, newColumnId, newOrder) => {
    if (USE_MOCK_API) {
      return mockApi.moveTask(taskId, newColumnId, newOrder);
    }
    const response = await apiClient.patch(`/tasks/${taskId}/move`, {
      columnId: newColumnId,
      order: newOrder,
    });
    return response.data;
  },
  
  deleteTask: async (id) => {
    if (USE_MOCK_API) {
      return mockApi.deleteTask(id);
    }
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
  
  // Get complete board data
  getBoardData: async (boardId) => {
    if (USE_MOCK_API) {
      return mockApi.getBoardData(boardId);
    }
    const response = await apiClient.get(`/boards/${boardId}/data`);
    return response.data;
  },
};

export default api;