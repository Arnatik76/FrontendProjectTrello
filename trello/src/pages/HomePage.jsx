import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ThemeToggle from "../components/ThemeToggle";

function HomePage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState("");

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const boardsData = await api.getBoards();
      setBoards(boardsData);
      setError(null);
    } catch (err) {
      setError("Failed to load boards. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    
    try {
      setLoading(true);
      await api.createBoard({ name: newBoardName });
      setNewBoardName("");
      await loadBoards();
    } catch (err) {
      setError("Failed to create board. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (board) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
  };

  const handleCancelEditing = () => {
    setEditingBoardId(null);
    setEditBoardName("");
  };

  const handleUpdateBoard = async (e, boardId) => {
    e.preventDefault();
    if (!editBoardName.trim()) return;
    
    try {
      setLoading(true);
      await api.updateBoard(boardId, { name: editBoardName });
      setEditingBoardId(null);
      await loadBoards();
    } catch (err) {
      setError("Failed to update board name. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="board-header">
        <h1 style={{ color: "var(--text-primary)" }}>Мои Доски</h1>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="create-board-form">
        <form onSubmit={handleCreateBoard} style={{ display: 'flex', alignItems: 'stretch' }}>
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Новая доска"
            disabled={loading}
            style={{ height: '38px', padding: '0 10px', boxSizing: 'border-box' }}
          />
          <button 
            type="submit" 
            disabled={loading || !newBoardName.trim()}
            style={{ height: '38px', padding: '0 15px', boxSizing: 'border-box', fontSize: '13px' }}
          >
            Создать доску
          </button>
        </form>
      </div>
      
      {loading && <div className="loading">Loading boards...</div>}
      
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
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this board?")) {
                        try {
                          await api.deleteBoard(board.id);
                          await loadBoards();
                        } catch (err) {
                          setError("Failed to delete board. Please try again.");
                          console.error(err);
                        }
                      }
                    }}
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
