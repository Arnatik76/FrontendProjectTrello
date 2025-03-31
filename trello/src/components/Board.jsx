import { useState } from "react";
import { Link } from "react-router-dom";
import Column from "./Column";

function Board({ 
  board, 
  onCreateColumn, 
  onUpdateColumn, 
  onDeleteColumn,
  onCreateTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
  onRefresh
}) {
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    
    onCreateColumn(newColumnTitle);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <Link to="/" className="back-button">Back to Boards</Link>
        <h1>{board.name}</h1>
        <button onClick={onRefresh} className="refresh-button">Refresh</button>
      </div>

      <div className="board-content">
        {board.columns.map(column => (
          <Column 
            key={column.id} 
            column={column}
            onUpdateColumn={onUpdateColumn}
            onDeleteColumn={onDeleteColumn}
            onCreateTask={onCreateTask}
            onUpdateTask={onUpdateTask}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
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