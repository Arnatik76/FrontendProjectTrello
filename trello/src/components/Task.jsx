import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import styles from './Task.module.css';
import { updateTask, deleteTask, reorderTaskOptimistic, persistTaskOrderInColumn } from '../store/slices/tasksSlice';
import { selectTasksStatus } from '../store/selectors';

const ItemTypes = {
  TASK: 'task'
};

function Task({ task }) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const tasksStatus = useSelector(selectTasksStatus);

  const isTaskUpdating = tasksStatus === 'loading'; // Проверяем, идет ли обновление

  // --- React DnD ---
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, index: task.order, columnId: task.columnId }, // Передаем order как index
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [task.id, task.order, task.columnId]); // Добавляем order и columnId в зависимости

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = task.order; // Используем task.order как hoverIndex
      const dragColumnId = item.columnId;
      const hoverColumnId = task.columnId;

      // Don't replace items with themselves or if not in the same column
      if (dragIndex === hoverIndex || dragColumnId !== hoverColumnId) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action (optimistic update)
      dispatch(reorderTaskOptimistic({
          draggedId: item.id,
          hoveredId: task.id,
          columnId: hoverColumnId // Указываем ID колонки
      }));

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
     drop: (item, monitor) => {
         // Dispatch action to persist order after drop only if it changed columns or order
         // This check might be redundant if moveTask handles it, but good for clarity
         if (item.columnId !== task.columnId || item.initialIndex !== task.order) { // Assuming initialIndex was set on drag start
             // Замените persistTaskOrder на persistTaskOrderInColumn
             dispatch(persistTaskOrderInColumn(task.columnId)); // Передаем только columnId
         }
     }
  }), [task.id, task.order, task.columnId, dispatch]); // Добавляем зависимости

  drag(drop(ref));

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent === task.content) {
      setIsEditing(false);
      return;
    }
    dispatch(updateTask({ id: task.id, taskData: { ...task, content: editContent } }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete task: "${task.content}"?`)) {
      dispatch(deleteTask(task.id));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(task.content);
  };

  return (
    <div
      ref={ref}
      // Используем styles.task и добавляем стиль для isDragging
      className={`${styles.task} ${isDragging ? styles.dragging : ''}`}
    >
      {isEditing ? (
        // Используем styles.editForm
        <form onSubmit={handleEditSubmit} className={styles.editForm}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
            disabled={isTaskUpdating} // Блокируем во время обновления
          />
          {/* Используем styles.formButtons */}
          <div className={styles.formButtons}>
            <button type="submit" disabled={isTaskUpdating || !editContent.trim() || editContent === task.content}>Save</button>
            <button type="button" onClick={handleCancelEdit} disabled={isTaskUpdating}>Cancel</button>
          </div>
        </form>
      ) : (
        // Используем styles.cardContent (если есть)
        <div className={styles.cardContent}>
          {/* Используем styles.cardText */}
          <span className={styles.cardText}>{task.content}</span>
          {/* Используем styles.cardActions */}
          <div className={styles.cardActions}>
            {/* Используем styles.editTaskBtn */}
            <button className={styles.editTaskBtn} onClick={() => setIsEditing(true)} disabled={isTaskUpdating}>Edit</button>
            {/* Используем styles.deleteTaskBtn */}
            <button className={styles.deleteTaskBtn} onClick={handleDelete} disabled={isTaskUpdating}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;