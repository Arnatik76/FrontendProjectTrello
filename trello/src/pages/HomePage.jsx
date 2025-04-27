import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
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

function HomePage() {
  const dispatch = useDispatch();

  const boards = useSelector(selectAllBoards);
  const status = useSelector(selectBoardsStatus);
  const error = useSelector(selectBoardsError);

  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState("");

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

    const boardToUpdate = boards.find(board => board.id === boardId);
    if (boardToUpdate) {
      dispatch(updateBoard({
        id: boardId,
        boardData: {
          ...boardToUpdate,
          name: editBoardName
        }
      }));
    }
    setEditingBoardId(null);
    setEditBoardName("");
  };

  const handleDeleteBoard = (boardId) => {
    if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      dispatch(deleteBoard(boardId));
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="home-container">
      <div className="board-header">
        <h1 style={{ color: "var(--text-primary)" }}>My Boards</h1>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>

      {error && <div className="error-message">Error: {error}</div>}

      <div className="create-board-form">
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
        <div className="loading">Loading boards...</div>
      )}

      <ul className="boards-list">
        {boards.map((board) => { // Removed index and logging
          // Ensure a valid key is passed, assuming board.id is now reliable
          // If board.id could *still* be bad temporarily, keep fallback or fix data source
          const key = board?.id; // Use board.id directly if API fix is reliable

          // Handle potential rendering if key is still somehow invalid (shouldn't happen after API fix)
          if (key === undefined || key === null) {
             console.error("Attempting to render board with invalid key:", board);
             return null; // Or render an error placeholder
          }


          return (
            // Use board.id directly as the key
            <li key={board.id} className="board-item">
              {editingBoardId === board.id ? (
                <form onSubmit={(e) => handleUpdateBoard(e, board.id)} className="edit-board-form">
                  <input
                    type="text"
                    value={editBoardName}
                    onChange={(e) => setEditBoardName(e.target.value)}
                    autoFocus
                    disabled={isLoading}
                  />
                  <div className="form-buttons">
                    <button type="submit" disabled={isLoading || !editBoardName.trim()}>Save</button>
                    <button type="button" onClick={handleCancelEditing} disabled={isLoading}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Use board.id for the link */}
                  <Link to={`/board/${board.id}`}>{board.name}</Link>
                  <div className="board-actions">
                    {/* Pass the full board object */}
                    <button
                      onClick={() => handleStartEditing(board)}
                      className="edit-board-btn"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    {/* Use board.id for deletion */}
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="delete-board-btn"
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