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
    dispatch(fetchBoards());
  }, [dispatch]);

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
  };

  const handleDeleteBoard = (boardId) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      dispatch(deleteBoard(boardId));
    }
  };

  return (
    <div className="home-container">
      <div className="board-header">
        <h1 style={{ color: "var(--text-primary)" }}>My Boards</h1>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="create-board-form">
        <form onSubmit={handleCreateBoard}>
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New Board"
            disabled={status === "loading"}
          />
          <button 
            type="submit" 
            disabled={status === "loading" || !newBoardName.trim()}
          >
            Create Board
          </button>
        </form>
      </div>
      
      {status === "loading" && boards.length === 0 && (
        <div className="loading">Loading boards...</div>
      )}
      
      <ul className="boards-list">
        {boards.map((board) => (
          <li key={board.id} className="board-item">
            {editingBoardId === board.id ? (
              <form onSubmit={(e) => handleUpdateBoard(e, board.id)} className="edit-board-form">
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  autoFocus
                />
                <div className="form-buttons">
                  <button type="submit" disabled={!editBoardName.trim()}>Save</button>
                  <button type="button" onClick={handleCancelEditing}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <Link to={`/board/${board.id}`}>{board.name}</Link>
                <div className="board-actions">
                  <button 
                    onClick={() => handleStartEditing(board)}
                    className="edit-board-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteBoard(board.id)}
                    className="delete-board-btn"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
