import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import styles from './HomePage.module.css';
import {
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard
} from "../store/slices/boardsSlice";
import {
  selectAllBoards,
  selectBoardsStatus,
  selectBoardsError
} from "../store/selectors";
import { logoutUser, selectUser } from "../store/slices/authSlice";

function HomePage() {
  const dispatch = useDispatch();
  const boards = useSelector(selectAllBoards);
  const status = useSelector(selectBoardsStatus);
  const error = useSelector(selectBoardsError);
  const user = useSelector(selectUser);

  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState("");

  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBoards());
    }
  }, [status, dispatch]);

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    dispatch(createBoard({ name: newBoardName }));
    setNewBoardName("");
  };

  const handleStartEditing = (board) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
  };

  const handleCancelEditing = () => {
    setEditingBoardId(null);
    setEditBoardName("");
  };

  const handleUpdateBoard = (e, boardId) => {
    e.preventDefault();
    if (!editBoardName.trim()) return;
    dispatch(updateBoard({ id: boardId, boardData: { name: editBoardName } }));
    handleCancelEditing();
  };

  const handleDeleteBoard = (boardId) => {
    if (window.confirm("Are you sure you want to delete this board? This cannot be undone.")) {
      dispatch(deleteBoard(boardId));
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.boardHeader}>
        <h1 style={{ color: "var(--text-primary)" }}>My Boards</h1>
        <div className={styles.boardActions}>
          <ThemeToggle />
        </div>
      </div>

      {error && <div className={styles.errorMessage}>Error: {error}</div>}

      <div className={styles.createBoardForm}>
        <form onSubmit={handleCreateBoard}>
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Enter new board name"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newBoardName.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Board'}
          </button>
        </form>
      </div>

      {isLoading && boards.length === 0 && (
        <div className={styles.loading}>Loading boards...</div>
      )}

      <ul className={styles.boardsList}>
        {boards.map((board) => {
          if (!board.id) {
             console.error("Attempting to render board with invalid key:", board);
             return null;
          }

          return (
            <li key={board.id} className={styles.boardItem}>
              {editingBoardId === board.id ? (
                <form onSubmit={(e) => handleUpdateBoard(e, board.id)} className={styles.editBoardForm}>
                  <input
                    type="text"
                    value={editBoardName}
                    onChange={(e) => setEditBoardName(e.target.value)}
                    autoFocus
                    disabled={isLoading}
                  />
                  <div className={styles.formButtons}>
                    <button type="submit" disabled={isLoading || !editBoardName.trim()}>Save</button>
                    <button type="button" onClick={handleCancelEditing} disabled={isLoading}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <Link to={`/board/${board.id}`} className={styles.boardLink}>{board.name}</Link>
                  <div className={styles.boardActions}>
                    <button
                      onClick={() => handleStartEditing(board)}
                      className={styles.editBoardBtn}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className={styles.deleteBoardBtn}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default HomePage;