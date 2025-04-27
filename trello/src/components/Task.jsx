import { useState, memo, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from 'react-dnd';
import { updateTask, deleteTask, reorderTaskOptimistic, persistTaskOrderInColumn } from "../store/slices/tasksSlice";
import { selectTasksStatus } from "../store/selectors";
import styles from './Task.module.css'; // Импортируем стили, если они есть

// Определяем тип перетаскиваемого элемента (можно вынести в константы)
const ItemTypes = {
  TASK: 'task',
};

function Task({ task }) {
  const dispatch = useDispatch();
  const tasksStatus = useSelector(selectTasksStatus);
  const ref = useRef(null); // Создаем ref для DOM-узла

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const isTaskUpdatingOrDeleting = tasksStatus === 'loading';

  // --- React DnD: Drag ---
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, columnId: task.columnId, order: task.order },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Опционально: можно добавить end для фиксации изменений на бэкенде после перетаскивания в той же колонке
    // end: (item, monitor) => {
    //   if (monitor.didDrop()) {
    //     const dropResult = monitor.getDropResult(); // Получаем результат из drop цели (колонки или задачи)
    //     // Если dropResult не определен (значит бросили на задачу, а не колонку)
    //     // или если колонка не изменилась, то нужно зафиксировать порядок в текущей колонке
    //     if (!dropResult || dropResult.columnId === item.columnId) {
    //       // TODO: Диспатчить async thunk для сохранения нового порядка задач в колонке item.columnId на бэкенде
    //       // dispatch(persistTaskOrder(item.columnId));
    //       console.log("Need to persist order for column:", item.columnId);
    //     }
    //   }
    // }
  }), [task.id, task.columnId, task.order]); // Добавляем зависимости

  // --- React DnD: Drop (для перестановки внутри колонки) ---
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    hover(item, monitor) {
      if (!ref.current) {
        return; // Убедимся, что DOM-узел существует
      }
      const dragId = item.id;
      const hoverId = task.id;

      // Не заменяем элементы сами на себя
      if (dragId === hoverId) {
        return;
      }

      // Определяем положение на экране
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Вертикальный центр
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Позиция курсора мыши
      const clientOffset = monitor.getClientOffset();
      // Расстояние от верха элемента до курсора
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Перетаскиваем только когда мышь пересекла половину высоты элемента
      // Когда перетаскиваем вниз, курсор должен быть ниже середины
      // Когда перетаскиваем вверх, курсор должен быть выше середины

      // Перетаскивание вниз
      if (item.order < task.order && hoverClientY < hoverMiddleY) {
        return;
      }
      // Перетаскивание вверх
      if (item.order > task.order && hoverClientY > hoverMiddleY) {
        return;
      }

      // Если задача перетаскивается в другую колонку, не делаем ничего здесь
      // (обработка будет в useDrop колонки)
      if (item.columnId !== task.columnId) {
         // Можно добавить визуальный фидбек, но не менять порядок
         return;
      }


      // Время выполнять действие (оптимистичное обновление)
      dispatch(reorderTaskOptimistic({
          columnId: task.columnId,
          draggedId: dragId,
          hoveredId: hoverId,
      }));

      // Примечание: чтобы избежать быстрого срабатывания,
      // обновляем order перетаскиваемого элемента в мониторе
      // Это не обязательно строго, если Redux обновляется быстро,
      // но может помочь в сложных случаях.
      item.order = task.order; // Мутируем item напрямую (рекомендовано react-dnd)

    },
    drop: (item, monitor) => {
      // Этот обработчик сработает, когда задача будет брошена НА ДРУГУЮ ЗАДАЧУ
      // в той же колонке (после того как hover уже отработал)
      const didDrop = monitor.didDrop(); // Проверяем, был ли drop обработан где-то еще (например, в колонке)

      // Если drop не был обработан (т.е. бросили не на колонку, а на задачу)
      // и задача осталась в той же колонке
      if (!didDrop && item.columnId === task.columnId) {
        // Вызываем thunk для сохранения порядка в этой колонке
        dispatch(persistTaskOrderInColumn(task.columnId));
      }
      // Можно вернуть объект, если нужно передать данные в endDrag
      // return { droppedOnTask: true, columnId: task.columnId };
    }
  }), [task.id, task.columnId, task.order, dispatch]);

  // Объединяем ref'ы для drag и drop
  drag(drop(ref)); // Применяем сначала drop, потом drag к ref

  const taskData = useMemo(() => {
    return {
      id: task.id,
      content: task.content,
    };
  }, [task.id, task.content]);

  const cardClasses = `card task ${isDragging ? 'dragging' : ''}`;

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
    // Применяем объединенный ref к корневому элементу задачи
    <div ref={ref} className={cardClasses} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {isEditing ? editForm : displayContent}
    </div>
  );
}

export default memo(Task);