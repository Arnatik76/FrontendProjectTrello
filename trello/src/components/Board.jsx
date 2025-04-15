import { useState } from "react";
import { Link } from "react-router-dom";
import Column from "./Column";
import ThemeToggle from "./ThemeToggle";
import { useBoardContext } from "../contexts/BoardContext";

function Board({ onNavigateHome }) {
  const { 
    boardData, 
    loading, 
    error, 
    refresh, 
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    moveTask,
    deleteTask
  } = useBoardContext();
  
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    
    createColumn(newColumnTitle);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  if (loading && !boardData) {
    return <div className="loading">Loading board...</div>;
  }

  if (error && !boardData) {
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
        <h1 style={{ color: "var(--text-primary)" }}>{boardData?.name || "Board"}</h1>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={refresh} className="refresh-button">Refresh</button>
        </div>
      </div>

      <div className="board-content">
        {boardData && boardData.columns && boardData.columns.map(column => (
          <Column 
            key={column.id} 
            column={column}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
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