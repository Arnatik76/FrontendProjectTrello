import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from "./Column";
import ThemeToggle from "./ThemeToggle";
import styles from './Board.module.css';
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
    return <div className={styles.loading}>Loading board...</div>;
  }

  if (boardError && !board) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>Error loading board: {boardError}</div>
        <button className={styles.backButton} onClick={onNavigateHome}>Back to Home</button>
      </div>
    );
  }

  if (boardStatus === 'succeeded' && !board) {
     return (
       <div className={styles.errorContainer}>
         <div className={styles.errorMessage}>Board not found.</div>
         <Link to="/" className={styles.backButton}>Back to Boards</Link>
       </div>
     );
  }

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardHeader}>
        <Link to="/" className={styles.backButton}>Back to Boards</Link>
        <h1 className={styles.boardTitle}>{board?.name || (isBoardLoading ? "Loading..." : "Board")}</h1>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <button onClick={refresh} className={styles.refreshButton} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && !boardError && <div className={styles.errorMessage}>Error: {error}</div>}

      <div className={styles.boardContent}>
        {areColumnsLoading && columns.length === 0 && <div className={styles.loading}>Loading columns...</div>}
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            index={index}
          />
        ))}

        {isAddingColumn ? (
          <div className={styles.addColumnForm}>
            <form onSubmit={handleAddColumn}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
                autoFocus
                disabled={columnsStatus === 'loading'}
              />
              <div className={styles.formButtons}>
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
          <div className={styles.addColumn}>
            <button
              className={styles.addColumnButton}
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