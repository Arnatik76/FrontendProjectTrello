import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import api from "../services/api";

function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoardData();
  }, [id]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      const data = await api.getBoardData(id);
      setBoardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load board data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async (title) => {
    try {
      await api.createColumn({
        boardId: parseInt(id),
        title,
        order: boardData.columns.length + 1,
      });
      await loadBoardData();
    } catch (err) {
      setError("Failed to create column. Please try again.");
      console.error(err);
    }
  };

  const handleColumnUpdate = async (columnId, title) => {
    try {
      await api.updateColumn(columnId, { title });
      await loadBoardData();
    } catch (err) {
      setError("Failed to update column. Please try again.");
      console.error(err);
    }
  };

  const handleColumnDelete = async (columnId) => {
    try {
      await api.deleteColumn(columnId);
      await loadBoardData();
    } catch (err) {
      setError("Failed to delete column. Please try again.");
      console.error(err);
    }
  };

  const handleCreateTask = async (columnId, content) => {
    try {
      if (!columnId || isNaN(parseInt(columnId)) || parseInt(columnId) <= 0) {
        setError("Недопустимый ID колонки");
        console.error("Попытка создать задачу с неверным ID колонки:", columnId);
        return;
      }
      
      // Убедимся, что columnId передается как число, а не строка
      const column = boardData.columns.find(col => col.id === parseInt(columnId));
      if (!column) {
        setError("Колонка не найдена");
        return;
      }
      
      await api.createTask({
        columnId: parseInt(columnId), // явно преобразуем в число
        content,
        order: column.tasks.length + 1,
      });
      await loadBoardData();
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error(err);
    }
  };

  const handleTaskUpdate = async (taskId, content) => {
    try {
      await api.updateTask(taskId, { content });
      await loadBoardData();
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error(err);
    }
  };

  const handleTaskMove = async (taskId, newColumnId, newOrder) => {
    try {
      await api.moveTask(taskId, newColumnId, newOrder);
      await loadBoardData();
    } catch (err) {
      setError("Failed to move task. Please try again.");
      console.error(err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      await loadBoardData();
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error(err);
    }
  };

  if (loading && !boardData) {
    return <div className="loading">Loading board...</div>;
  }

  if (error && !boardData) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (!boardData) {
    return <div>Board not found</div>;
  }

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <Board 
        board={boardData} 
        onCreateColumn={handleCreateColumn}
        onUpdateColumn={handleColumnUpdate}
        onDeleteColumn={handleColumnDelete}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleTaskUpdate}
        onMoveTask={handleTaskMove}
        onDeleteTask={handleTaskDelete}
        onRefresh={loadBoardData}
      />
    </>
  );
}

export default BoardPage;