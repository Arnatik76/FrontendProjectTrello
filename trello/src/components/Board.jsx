import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Column from "./Column";
import ThemeToggle from "./ThemeToggle";
import { 
  fetchBoardById
} from "../store/actions/boardActions";
import { 
  fetchColumns,
  createColumn
} from "../store/actions/columnActions";
import { fetchAllTasks } from "../store/actions/taskActions";
import { 
  selectCurrentBoard, 
  selectAllColumns,
  selectBoardsStatus, 
  selectBoardsError
} from "../store/selectors";

function Board({ onNavigateHome, boardId }) {
  const dispatch = useDispatch();
  
  // Получаем данные из Redux хранилища
  const board = useSelector(selectCurrentBoard);
  const columns = useSelector(selectAllColumns);
  const status = useSelector(selectBoardsStatus);
  const error = useSelector(selectBoardsError);
  
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  useEffect(() => {
    // Загружаем данные доски и колонки при монтировании
    dispatch(fetchBoardById(boardId));
    dispatch(fetchColumns(boardId));
    // Загружаем все задачи для этой доски
    dispatch(fetchAllTasks(boardId));
  }, [boardId, dispatch]);

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    
    // Диспетчеризация действия для создания новой колонки
    dispatch(createColumn({
      boardId: parseInt(boardId),
      title: newColumnTitle,
      order: columns.length
    }));
    
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const refresh = () => {
    // Обновляем данные
    dispatch(fetchBoardById(boardId));
    dispatch(fetchColumns(boardId));
    dispatch(fetchAllTasks(boardId));
  };

  if (status === "loading" && !board) {
    return <div className="loading">Loading board...</div>;
  }

  if (error && !board) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={onNavigateHome}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <Link to="/" className="back-button">Back to Boards</Link>
        <h1 style={{ color: "var(--text-primary)" }}>{board?.name || "Board"}</h1>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={refresh} className="refresh-button">Refresh</button>
        </div>
      </div>

      <div className="board-content">
        {columns.map(column => (
          <Column 
            key={column.id} 
            column={column}
          />
        ))}
        
        {isAddingColumn ? (
          <div className="add-column-form">
            <form onSubmit={handleAddColumn}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
                autoFocus
              />
              <div className="form-buttons">
                <button type="submit">Add Column</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="add-column">
            <button 
              className="add-column-button"
              onClick={() => setIsAddingColumn(true)}
            >
              + Add another column
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Board;