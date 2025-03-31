import { useState } from 'react';
import Task from "./Task";

function Column({ 
  column,
  onUpdateColumn,
  onDeleteColumn,
  onCreateTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    
    onUpdateColumn(column.id, editTitle);
    setIsEditing(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    
    // Убедитесь, что column.id не undefined и не 0
    console.log("Creating task in column ID:", column.id);
    
    onCreateTask(column.id, newTaskContent);
    setNewTaskContent("");
    setIsAddingTask(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm("Are you sure you want to delete this column and all its tasks?")) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
            />
            <div className="form-buttons">
              <button type="submit">Save</button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(column.title);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="column-title-container">
            <span className="column-title">{column.title}</span>
            <div className="column-actions">
              <button 
                className="edit-column-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button 
                className="delete-column-btn"
                onClick={handleDeleteColumn}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="column-cards">
        {column.tasks.map((task) => (
          <Task 
            key={task.id} 
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
      
      {isAddingTask ? (
        <div className="add-task-form">
          <form onSubmit={handleAddTask}>
            <textarea
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="Enter task content"
              autoFocus
            />
            <div className="form-buttons">
              <button type="submit">Add Task</button>
              <button 
                type="button" 
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          className="add-card-button"
          onClick={() => setIsAddingTask(true)}
        >
          + Add a card
        </button>
      )}
    </div>
  );
}

export default Column;