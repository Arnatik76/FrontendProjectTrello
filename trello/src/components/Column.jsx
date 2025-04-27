import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Task from "./Task";
import {
  updateColumn,
  deleteColumn
} from "../store/slices/columnsSlice";
import { createTask } from "../store/slices/tasksSlice";
import { selectTasksByColumn, selectTasksStatus, selectColumnsStatus } from "../store/selectors";

function Column({ column }) {
  const dispatch = useDispatch();

  const tasks = useSelector(state => selectTasksByColumn(state, column.id));
  const tasksStatus = useSelector(selectTasksStatus);
  const columnsStatus = useSelector(selectColumnsStatus);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  const isColumnUpdating = columnsStatus === 'loading';
  const isTaskCreating = tasksStatus === 'loading';

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim() || editTitle === column.title) {
       setIsEditing(false);
       return;
    }

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
    console.log("handleAddTask called. Content:", newTaskContent, "Is loading:", isTaskCreating); // Добавлено
    if (!newTaskContent.trim()) {
      console.log("Content is empty. Aborting."); // Добавлено
      return; 
    }

    console.log("Dispatching createTask..."); // Добавлено
    dispatch(createTask({
      columnId: column.id,
      content: newTaskContent,
      order: tasks.length 
    }));

    setNewTaskContent("");
    setIsAddingTask(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Are you sure you want to delete the column "${column.title}" and all its tasks? This cannot be undone.`)) {
      dispatch(deleteColumn(column.id));
    }
  };

  const handleCancelEdit = () => {
     setIsEditing(false);
     setEditTitle(column.title);
  };

  const handleCancelAddTask = () => {
     setIsAddingTask(false);
     setNewTaskContent("");
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
              disabled={isColumnUpdating}
            />
            <div className="form-buttons">
              <button type="submit" disabled={isColumnUpdating || !editTitle.trim() || editTitle === column.title}>Save</button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isColumnUpdating}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="column-title-container">
            <span className="column-title" onClick={() => setIsEditing(true)}>{column.title}</span>
            <div className="column-actions">
              <button
                className="edit-column-btn"
                onClick={() => setIsEditing(true)}
                disabled={isColumnUpdating}
              >
                Edit
              </button>
              <button
                className="delete-column-btn"
                onClick={handleDeleteColumn}
                disabled={isColumnUpdating}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="column-cards">
        {tasksStatus === 'loading' && tasks.length === 0 && <div>Loading tasks...</div>}
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
              disabled={isTaskCreating}
            />
            <div className="form-buttons">
              <button type="submit" disabled={isTaskCreating || !newTaskContent.trim()}>
                {isTaskCreating ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={handleCancelAddTask}
                disabled={isTaskCreating}
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
          disabled={isTaskCreating || isColumnUpdating}
        >
          + Add a card
        </button>
      )}
    </div>
  );
}

export default Column;