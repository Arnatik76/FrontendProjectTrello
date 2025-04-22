import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Task from "./Task";
import { 
  updateColumn,
  deleteColumn
} from "../store/slices/columnsSlice";
import { createTask } from "../store/slices/tasksSlice";
import { selectTasksByColumn } from "../store/selectors";

function Column({ column }) {
  const dispatch = useDispatch();
  
  const tasks = useSelector(state => selectTasksByColumn(state, column.id));
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    
    dispatch(updateColumn({
      id: column.id,
      columnData: {
        ...column,
        title: editTitle
      }
    }));
    
    setIsEditing(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    
    dispatch(createTask({
      columnId: column.id,
      content: newTaskContent,
      order: tasks.length
    }));
    
    setNewTaskContent("");
    setIsAddingTask(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm("Are you sure you want to delete this column and all its tasks?")) {
      dispatch(deleteColumn(column.id));
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
        {tasks.map((task) => (
          <Task 
            key={task.id} 
            task={task}
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