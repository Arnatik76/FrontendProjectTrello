import { useState } from 'react';

function Task({ task, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    onUpdateTask(task.id, editContent);
    setIsEditing(false);
  };

  const handleDeleteTask = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  };

  return (
    <div className="card">
      {isEditing ? (
        <form onSubmit={handleEditSubmit}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
          <div className="form-buttons">
            <button type="submit">Save</button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setEditContent(task.content);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="card-content">
          <div className="card-text">{task.content}</div>
          <div className="card-actions">
            <button 
              className="edit-task-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button 
              className="delete-task-btn"
              onClick={handleDeleteTask}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;