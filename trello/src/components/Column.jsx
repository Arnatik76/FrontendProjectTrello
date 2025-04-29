import { useState, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useDrop, useDrag } from 'react-dnd';
import Task from "./Task";
import styles from './Column.module.css'; // <--- Импортируйте CSS модуль
import {
  updateColumn,
  deleteColumn,
  reorderColumnOptimistic,
  persistColumnOrder
} from "../store/slices/columnsSlice";
import { createTask, moveTask } from "../store/slices/tasksSlice";
import { selectTasksByColumn, selectTasksStatus, selectColumnsStatus } from "../store/selectors";

const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column'
};

function Column({ column, index }) {
  const dispatch = useDispatch();
  const ref = useRef(null);

  const tasks = useSelector(state => selectTasksByColumn(state, column.id));
  const tasksStatus = useSelector(selectTasksStatus);
  const columnsStatus = useSelector(selectColumnsStatus);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  // --- React DnD для задач ---
  const [{ isOver, canDrop }, dropTask] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item, monitor) => {
      if (item.columnId !== column.id) {
        const newOrder = tasks.length;
        dispatch(moveTask({
          taskId: item.id,
          targetColumnId: column.id,
          order: newOrder,
        }));
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [column.id, tasks.length, dispatch]);

  // --- React DnD для колонок ---
  const [{ isDragging }, dragColumn] = useDrag(() => ({
    type: ItemTypes.COLUMN,
    item: { id: column.id, index, order: column.order },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [column.id, index, column.order]);

  // --- React DnD для перетаскивания колонок ---
  const [, dropColumn] = useDrop(() => ({
    accept: ItemTypes.COLUMN,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      dispatch(reorderColumnOptimistic({
        draggedId: item.id,
        hoveredId: column.id
      }));

      item.index = hoverIndex;
    },
    drop: () => {
      dispatch(persistColumnOrder());
    }
  }), [index, column.id, dispatch]);

  dragColumn(dropColumn(ref));

  const columnRef = (el) => {
    ref.current = el;
    dropTask(el);
  };

  const isColumnUpdating = columnsStatus === 'loading';
  const isTaskCreating = tasksStatus === 'loading';

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim() || editTitle === column.title) {
       setIsEditing(false);
       return;
    }
    dispatch(updateColumn({ id: column.id, columnData: { ...column, title: editTitle } }));
    setIsEditing(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    dispatch(createTask({ columnId: column.id, content: newTaskContent, order: tasks.length }));
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
    // Используем styles.column
    <div 
      ref={columnRef} 
      className={`
        ${styles.column} 
        ${isDragging ? styles.dragging : ''}
        ${isOver && canDrop ? styles.dropTarget : ''}
      `}
    >
      {/* Используем styles.columnHeader */}
      <div className={styles.columnHeader}>
        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              disabled={isColumnUpdating}
            />
            {/* Используем styles.formButtons */}
            <div className={styles.formButtons}>
              <button type="submit" disabled={isColumnUpdating || !editTitle.trim() || editTitle === column.title}>Save</button>
              <button type="button" onClick={handleCancelEdit} disabled={isColumnUpdating}>Cancel</button>
            </div>
          </form>
        ) : (
          // Используем styles.columnTitleContainer
          <div className={styles.columnTitleContainer}>
            {/* Используем styles.columnTitle */}
            <span className={styles.columnTitle} onClick={() => setIsEditing(true)}>{column.title}</span>
            {/* Используем styles.columnActions */}
            <div className={styles.columnActions}>
              {/* Используем styles.editColumnBtn */}
              <button className={styles.editColumnBtn} onClick={() => setIsEditing(true)} disabled={isColumnUpdating}>Edit</button>
              {/* Используем styles.deleteColumnBtn */}
              <button className={styles.deleteColumnBtn} onClick={handleDeleteColumn} disabled={isColumnUpdating}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {/* Используем styles.columnCards */}
      <div className={styles.columnCards}>
        {tasksStatus === 'loading' && tasks.length === 0 && <div>Loading tasks...</div>}
        {tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
        {isOver && canDrop && tasks.length === 0 && (
          <div className={styles.dropPlaceholder}>Drop here</div>
        )}
      </div>

      {isAddingTask ? (
        // Используем styles.addTaskForm
        <div className={styles.addTaskForm}>
          <form onSubmit={handleAddTask}>
            <textarea
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="Enter task content"
              autoFocus
              disabled={isTaskCreating}
            />
            {/* Используем styles.formButtons */}
            <div className={styles.formButtons}>
              <button type="submit" disabled={isTaskCreating || !newTaskContent.trim()}>
                {isTaskCreating ? 'Adding...' : 'Add Task'}
              </button>
              <button type="button" onClick={handleCancelAddTask} disabled={isTaskCreating}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        // Используем styles.addCardButton
        <button
          className={styles.addCardButton}
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