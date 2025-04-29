import React, { useState, useRef, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import styles from './Task.module.css';
import { updateTask, deleteTask, reorderTaskOptimistic, persistTaskOrderInColumn } from '../store/slices/tasksSlice';
import { selectTasksStatus } from '../store/selectors';

const ItemTypes = {
  TASK: 'task'
};

const Task = memo(function Task({ task }) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const tasksStatus = useSelector(selectTasksStatus);

  const isTaskUpdating = tasksStatus === 'loading';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, index: task.order, columnId: task.columnId, initialIndex: task.order },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [task.id, task.order, task.columnId, isTaskUpdating]);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    hover(item, monitor) {
      if (!ref.current || isTaskUpdating) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = task.order;
      const dragColumnId = item.columnId;
      const hoverColumnId = task.columnId;

      if (dragIndex === hoverIndex && dragColumnId === hoverColumnId) {
        return;
      }

      if (dragColumnId !== hoverColumnId) {
          return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      dispatch(reorderTaskOptimistic({
          draggedId: item.id,
          hoveredId: task.id,
          columnId: hoverColumnId
      }));

      item.index = hoverIndex;
    },
     drop: (item, monitor) => {
         const didMove = item.columnId !== task.columnId || item.initialIndex !== task.order;
         if (didMove && item.columnId === task.columnId) {
             dispatch(persistTaskOrderInColumn(task.columnId));
         }
         item.initialIndex = task.order;
     }
  }), [task.id, task.order, task.columnId, dispatch, isTaskUpdating]);

  drag(drop(ref));

  const handleEditSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedContent = editContent.trim();
    if (!trimmedContent || trimmedContent === task.content) {
      setIsEditing(false);
      setEditContent(task.content);
      return;
    }
    dispatch(updateTask({ id: task.id, taskData: { content: trimmedContent } }));
    setIsEditing(false);
  }, [dispatch, task.id, task.content, editContent]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete task: "${task.content}"?`)) {
      dispatch(deleteTask(task.id));
    }
  }, [dispatch, task.id, task.content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(task.content);
  }, [task.content]);

  const startEditing = useCallback(() => {
      setIsEditing(true);
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.task} ${isDragging ? styles.dragging : ''}`}
      data-testid={`task-${task.id}`}
    >
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className={styles.editForm}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
            onBlur={handleCancelEdit}
            disabled={isTaskUpdating}
          />
          <div className={styles.formButtons}>
            <button type="submit" disabled={isTaskUpdating || !editContent.trim() || editContent.trim() === task.content}>Save</button>
            <button type="button" onClick={handleCancelEdit} disabled={isTaskUpdating}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className={styles.cardContent}>
          <span className={styles.cardText} onClick={startEditing}>{task.content}</span>
          <div className={styles.cardActions}>
            <button className={styles.editTaskBtn} onClick={startEditing} disabled={isTaskUpdating}>Edit</button>
            <button className={styles.deleteTaskBtn} onClick={handleDelete} disabled={isTaskUpdating}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Task;