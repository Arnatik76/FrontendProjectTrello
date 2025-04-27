import { useState, memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { updateTask, deleteTask } from "../store/slices/tasksSlice";
import { selectTasksStatus } from "../store/selectors";

function Task({ task }) {
  const dispatch = useDispatch();
  const tasksStatus = useSelector(selectTasksStatus);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const isTaskUpdatingOrDeleting = tasksStatus === 'loading';

  const taskData = useMemo(() => {
    return {
      id: task.id,
      content: task.content,
    };
  }, [task.id, task.content /*, task.date, task.priority */]);

  // const cardClasses = useMemo(() => {
  //   const classes = ['card', 'task']; // Add base 'task' class if needed
  //   if (task.priority === 'high') classes.push('priority-high');
  //   // ... other priorities
  //   return classes.join(' ');
  // }, [task.priority]);
  const cardClasses = 'card task';

  const handleContentChange = useCallback((e) => {
    setEditContent(e.target.value);
  }, []);

  const handleEditSubmit = useCallback((e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent === task.content) {
      setIsEditing(false);
      return;
    }

    dispatch(updateTask({
      id: task.id,
      taskData: {
        ...task,
        content: editContent
      }
    }));

    setIsEditing(false);
  }, [task, editContent, dispatch]);

  const handleDeleteTask = useCallback(() => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(task.id));
    }
  }, [task.id, dispatch]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditContent(task.content);
  }, [task.content]);

  const handleCancelClick = useCallback(() => {
    setIsEditing(false);
    setEditContent(task.content);
  }, [task.content]);

  const editForm = useMemo(() => (
    <form onSubmit={handleEditSubmit}>
      <textarea
        value={editContent}
        onChange={handleContentChange}
        autoFocus
        disabled={isTaskUpdatingOrDeleting}
      />
      <div className="form-buttons">
        <button type="submit" disabled={isTaskUpdatingOrDeleting || !editContent.trim() || editContent === task.content}>Save</button>
        <button
          type="button"
          onClick={handleCancelClick}
          disabled={isTaskUpdatingOrDeleting}
        >
          Cancel
        </button>
      </div>
    </form>
  ), [editContent, handleContentChange, handleEditSubmit, handleCancelClick, isTaskUpdatingOrDeleting, task.content]);

  const displayContent = useMemo(() => (
    <div className="card-content">
      <div className="card-text" onClick={handleEditClick}>{taskData.content}</div>
      <div className="card-actions">
        <button
          className="edit-task-btn"
          onClick={handleEditClick}
          disabled={isTaskUpdatingOrDeleting}
        >
          Edit
        </button>
        <button
          className="delete-task-btn"
          onClick={handleDeleteTask}
          disabled={isTaskUpdatingOrDeleting}
        >
          Delete
        </button>
      </div>
    </div>
  ), [taskData, handleEditClick, handleDeleteTask, isTaskUpdatingOrDeleting]);

  return (
    <div className={cardClasses}>
      {isEditing ? editForm : displayContent}
    </div>
  );
}

export default memo(Task, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.content === nextProps.task.content &&
         prevProps.task.order === nextProps.task.order;
});