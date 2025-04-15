import { useState, memo, useCallback, useMemo } from 'react';

function Task({ task, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const taskData = useMemo(() => {
    return {
      id: task.id,
      content: task.content,
      formattedDate: task.date ? new Date(task.date).toLocaleDateString() : null,
    };
  }, [task.id, task.content, task.date]);

  const cardClasses = useMemo(() => {
    const classes = ['card'];
    if (task.priority === 'high') classes.push('priority-high');
    if (task.priority === 'medium') classes.push('priority-medium');
    if (task.priority === 'low') classes.push('priority-low');
    return classes.join(' ');
  }, [task.priority]);

  const handleContentChange = useCallback((e) => {
    setEditContent(e.target.value);
  }, []);

  const handleEditSubmit = useCallback((e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    onUpdateTask(task.id, editContent);
    setIsEditing(false);
  }, [task.id, editContent, onUpdateTask]);

  const handleDeleteTask = useCallback(() => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  }, [task.id, onDeleteTask]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

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
      />
      <div className="form-buttons">
        <button type="submit">Save</button>
        <button 
          type="button" 
          onClick={handleCancelClick}
        >
          Cancel
        </button>
      </div>
    </form>
  ), [editContent, handleContentChange, handleEditSubmit, handleCancelClick]);

  const displayContent = useMemo(() => (
    <div className="card-content">
      <div className="card-text">{taskData.content}</div>
      {taskData.formattedDate && <div className="card-date">{taskData.formattedDate}</div>}
      <div className="card-actions">
        <button 
          className="edit-task-btn"
          onClick={handleEditClick}
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
  ), [taskData, handleEditClick, handleDeleteTask]);

  return (
    <div className={cardClasses}>
      {isEditing ? editForm : displayContent}
    </div>
  );
}

export default memo(Task, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id && 
         prevProps.task.content === nextProps.task.content &&
         prevProps.onUpdateTask === nextProps.onUpdateTask &&
         prevProps.onDeleteTask === nextProps.onDeleteTask;
});