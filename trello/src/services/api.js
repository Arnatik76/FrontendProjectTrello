import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const handleApiError = (error) => {
  const status = error.response?.status || 500;
  let message = error.response?.data?.message || error.message || 'Something went wrong';

  if (status === 401 || status === 403) {
     message = error.response?.data?.message || 'You are not authorized for this action.';
     // window.location.href = '/login';
  } else if (status === 404) {
    message = error.response?.data?.message || 'The requested resource was not found';
  } else {
    console.error(`API Error (${status}): ${message}`, error);
  }

  throw { message, status, error: error.response?.data || error };
};


const api = {
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
       console.error("Logout API call failed:", error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Boards
  getBoards: async () => {
    try {
      const response = await apiClient.get("/boards");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getBoard: async (id) => {
    try {
      const response = await apiClient.get(`/boards/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createBoard: async (boardData) => {
    try {
      const response = await apiClient.post("/boards", boardData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateBoard: async (id, boardData) => {
    try {
      const response = await apiClient.put(`/boards/${id}`, boardData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteBoard: async (id) => {
    try {
      const response = await apiClient.delete(`/boards/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },


  // Columns
  getColumns: async (boardId) => {
    try {
      const response = await apiClient.get(`/boards/${boardId}/columns`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createColumn: async (columnData) => {
    try {
      const response = await apiClient.post("/columns", columnData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateColumn: async (id, columnData) => {
    try {
      const response = await apiClient.put(`/columns/${id}`, columnData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteColumn: async (id) => {
    try {
      const response = await apiClient.delete(`/columns/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },


  // Tasks
  getTasks: async (columnId) => {
    try {
      const response = await apiClient.get(`/columns/${columnId}/tasks`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await apiClient.post("/tasks", taskData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default api;