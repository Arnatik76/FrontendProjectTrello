import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function HomePage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");

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

  return (
    <div className="home-container">
      <h1>Мои Доски</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="create-board-form">
        <form onSubmit={handleCreateBoard}>
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Новая доска"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newBoardName.trim()}>
            Создать доску
          </button>
        </form>
      </div>
      
      {loading && <div className="loading">Loading boards...</div>}
      
      <ul className="boards-list">
        {boards.map((board) => (
          <li key={board.id} className="board-item">
            <Link to={`/board/${board.id}`}>{board.name}</Link>
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
