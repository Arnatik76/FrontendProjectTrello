import { useState, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useDrop, useDrag } from 'react-dnd'; // Добавляем useDrag
import Task from "./Task";
import {
  updateColumn,
  deleteColumn,
  reorderColumnOptimistic, // Будем добавлять в columnsSlice
  persistColumnOrder // Будем добавлять в columnsSlice
} from "../store/slices/columnsSlice";
import { createTask, moveTask } from "../store/slices/tasksSlice";
import { selectTasksByColumn, selectTasksStatus, selectColumnsStatus } from "../store/selectors";

const ItemTypes = {
  TASK: 'task',
  COLUMN: 'column' // Добавляем тип для колонок
};

function Column({ column, index }) { // Добавляем index для определения позиции колонки
  const dispatch = useDispatch();
  const ref = useRef(null); // Ref для DOM-элемента колонки

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

      // Не перемещаем элемент, если он находится над собой
      if (dragIndex === hoverIndex) {
        return;
      }

      // Получаем размеры элемента
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Горизонтальный центр
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      // Позиция указателя мыши
      const clientOffset = monitor.getClientOffset();
      
      // Получаем расстояние от левого края
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      // Перемещаем только когда мышь пересекла половину ширины
      // Когда двигаемся слева - мышь должна быть левее середины
      // Когда справа - мышь должна быть правее середины
      
      // Перетаскивание слева направо
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      // Перетаскивание справа налево
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      // Выполняем оптимистичное обновление порядка колонок в Redux
      dispatch(reorderColumnOptimistic({
        draggedId: item.id,
        hoveredId: column.id
      }));

      // Обновляем индекс элемента для более плавного перетаскивания
      item.index = hoverIndex;
    },
    drop: () => {
      // Сохраняем изменения порядка колонок на сервере
      dispatch(persistColumnOrder());
    }
  }), [index, column.id, dispatch]);

  // Объединяем drag и drop для колонок
  dragColumn(dropColumn(ref));
  
  // Объединяем ref для перетаскивания колонки и приема задач
  const columnRef = (el) => {
    ref.current = el; // Сохраняем ссылку на элемент колонки
    dropTask(el); // Применяем dropTask к элементу колонки
  };

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
    if (!newTaskContent.trim()) {
      return; 
    }

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

  // Определяем стиль для колонки (включая эффекты перетаскивания)
  const columnStyle = {
    backgroundColor: isOver && canDrop ? 'rgba(0, 255, 0, 0.1)' : 'var(--bg-secondary)',
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div ref={columnRef} className="column" style={columnStyle}>
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
        {isOver && canDrop && tasks.length === 0 && (
            <div style={{ height: '50px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '0.5rem', borderRadius: '4px' }}>Drop here</div>
        )}
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