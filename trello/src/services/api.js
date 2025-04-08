import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

const handleApiError = (error) => {
  const status = error.response?.status || 500;
  let message = error.response?.data?.message || error.message || 'Something went wrong';
  
  if (status === 404) {
    message = error.response?.data?.message || 'The requested resource was not found';
    console.error(`Not Found (404): ${message}`, error);
  } else {
    console.error(`API Error (${status}): ${message}`, error);
  }
  
  throw { message, status, error };
};

const api = {

  // Boards
  getBoards: async () => {
    try {
      const response = await apiClient.get("/boards");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getBoard: async (id) => {
    try {
      const response = await apiClient.get(`/boards/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  createBoard: async (boardData) => {
    try {
      const response = await apiClient.post("/boards", boardData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  updateBoard: async (id, boardData) => {
    try {
      const response = await apiClient.put(`/boards/${id}`, boardData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  deleteBoard: async (id) => {
    try {
      const response = await apiClient.delete(`/boards/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },


  // Columns
  getColumns: async (boardId) => {
    try {
      const response = await apiClient.get(`/boards/${boardId}/columns`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  createColumn: async (columnData) => {
    try {
      const response = await apiClient.post("/columns", columnData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  updateColumn: async (id, columnData) => {
    try {
      const response = await apiClient.put(`/columns/${id}`, columnData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  deleteColumn: async (id) => {
    try {
      const response = await apiClient.delete(`/columns/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },


  // Tasks
  getTasks: async (columnId) => {
    try {
      const response = await apiClient.get(`/columns/${columnId}/tasks`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  createTask: async (taskData) => {
    try {
      const response = await apiClient.post("/tasks", taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  updateTask: async (id, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  deleteTask: async (id) => {
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getBoardData: async (boardId) => {
    try {
      const response = await apiClient.get(`/boards/${boardId}/data`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default api;