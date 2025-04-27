import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Column from "./Column";
import ThemeToggle from "./ThemeToggle";
import {
  fetchBoardById
} from "../store/slices/boardsSlice";
import {
  fetchColumns,
  createColumn
} from "../store/slices/columnsSlice";
import { fetchAllTasks } from "../store/slices/tasksSlice";
import {
  selectCurrentBoard,
  selectAllColumns,
  selectBoardsStatus,
  selectColumnsStatus,
  selectBoardsError,
  selectColumnsError,
  selectTasksError,
  selectTasksStatus
} from "../store/selectors";

function Board({ onNavigateHome, boardId }) {
  const dispatch = useDispatch();

  const board = useSelector(selectCurrentBoard);
  const columns = useSelector(selectAllColumns);
  const boardStatus = useSelector(selectBoardsStatus);
  const columnsStatus = useSelector(selectColumnsStatus);
  const tasksStatus = useSelector(selectTasksStatus);

  const boardError = useSelector(selectBoardsError);
  const columnsError = useSelector(selectColumnsError);
  const tasksError = useSelector(selectTasksError);
  const error = boardError || columnsError || tasksError;

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    dispatch(createColumn({
      boardId: boardId,
      title: newColumnTitle,
      order: columns.length
    }));

    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const refresh = () => {
    dispatch(fetchBoardById(boardId));
    dispatch(fetchAllTasks(boardId));
  };

  const isBoardLoading = boardStatus === 'loading';
  const areColumnsLoading = columnsStatus === 'loading';
  const areTasksLoading = tasksStatus === 'loading';
  const isLoading = isBoardLoading || areColumnsLoading || areTasksLoading;

  if (isBoardLoading && !board) {
    return <div className="loading">Loading board...</div>;
  }

  if (boardError && !board) {
    return (
      <div className="error-container">
        <div className="error-message">Error loading board: {boardError}</div>
        <button onClick={onNavigateHome}>Back to Home</button>
      </div>
    );
  }

  if (boardStatus === 'succeeded' && !board) {
     return (
       <div className="error-container">
         <div className="error-message">Board not found.</div>
         <Link to="/" className="back-button">Back to Boards</Link>
       </div>
     );
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <Link to="/" className="back-button">Back to Boards</Link>
        <h1 style={{ color: "var(--text-primary)" }}>{board?.name || (isBoardLoading ? "Loading..." : "Board")}</h1>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={refresh} className="refresh-button" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && !boardError && <div className="error-message">Error: {error}</div>}

      <div className="board-content">
        {areColumnsLoading && columns.length === 0 && <div className="loading">Loading columns...</div>}
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
                disabled={columnsStatus === 'loading'}
              />
              <div className="form-buttons">
                <button type="submit" disabled={columnsStatus === 'loading' || !newColumnTitle.trim()}>
                  {columnsStatus === 'loading' ? 'Adding...' : 'Add Column'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                  disabled={columnsStatus === 'loading'}
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
              disabled={isLoading}
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