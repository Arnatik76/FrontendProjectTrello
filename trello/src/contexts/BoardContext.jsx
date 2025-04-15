import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const BoardContext = createContext();

export const BoardProvider = ({ children, boardId }) => {
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBoardData(boardId);
      setBoardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load board data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const createColumn = useCallback(async (title) => {
    try {
      await api.createColumn({
        boardId: parseInt(boardId),
        title,
        order: boardData?.columns.length + 1 || 0,
      });
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to create column. Please try again.");
      console.error(err);
      return false;
    }
  }, [boardId, boardData, loadBoardData]);

  const updateColumn = useCallback(async (columnId, newTitle) => {
    try {
      const existingColumn = boardData?.columns.find(c => c.id === columnId);
      
      if (!existingColumn) {
        throw new Error("Column not found");
      }
      
      const updatedColumn = {
        ...existingColumn,
        title: newTitle
      };
      
      await api.updateColumn(columnId, updatedColumn);
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to update column. Please try again.");
      console.error(err);
      return false;
    }
  }, [boardData, loadBoardData]);

  const deleteColumn = useCallback(async (columnId) => {
    try {
      await api.deleteColumn(columnId);
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to delete column. Please try again.");
      console.error(err);
      return false;
    }
  }, [loadBoardData]);

  const createTask = useCallback(async (columnId, content) => {
    try {
      const column = boardData?.columns.find(c => c.id === columnId);
      await api.createTask({
        columnId,
        content,
        order: column?.tasks?.length + 1 || 0,
      });
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error(err);
      return false;
    }
  }, [boardData, loadBoardData]);

  const updateTask = useCallback(async (taskId, newContent) => {
    try {
      let existingTask = null;
      boardData?.columns.forEach(column => {
        const task = column.tasks.find(t => t.id === taskId);
        if (task) {
          existingTask = { ...task };
        }
      });

      if (!existingTask) {
        throw new Error("Task not found");
      }

      const updatedTask = {
        ...existingTask,
        content: newContent
      };
      
      await api.updateTask(taskId, updatedTask);
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error(err);
      return false;
    }
  }, [boardData, loadBoardData]);

  const moveTask = useCallback(async (taskId, targetColumnId, order) => {
    try {
      await api.moveTask(taskId, { columnId: targetColumnId, order });
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to move task. Please try again.");
      console.error(err);
      return false;
    }
  }, [loadBoardData]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await api.deleteTask(taskId);
      await loadBoardData();
      return true;
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error(err);
      return false;
    }
  }, [loadBoardData]);

  useEffect(() => {
    loadBoardData();
  }, [boardId, loadBoardData]);

  return (
    <BoardContext.Provider value={{
      boardData,
      loading,
      error,
      refresh: loadBoardData,
      createColumn,
      updateColumn,
      deleteColumn,
      createTask,
      updateTask,
      moveTask,
      deleteTask
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return context;
};