import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchBoardById } from "../store/slices/boardsSlice";
import { fetchAllTasks } from "../store/slices/tasksSlice"; // <--- ДОБАВИТЬ ЭТОТ ИМПОРТ
import Board from "../components/Board";

function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const boardId = parseInt(id, 10); // Парсим ID

  useEffect(() => {
    // Проверяем, является ли boardId валидным числом
    if (isNaN(boardId)) {
      console.error("Invalid board ID:", id);
      // Можно показать сообщение об ошибке или перенаправить
      navigate('/'); // Перенаправляем на главную страницу
      return; // Прерываем выполнение useEffect
    }

    // Загружаем данные только если boardId валидный
    dispatch(fetchBoardById(boardId));
    dispatch(fetchAllTasks(boardId)); // Теперь fetchAllTasks определена

  }, [boardId, dispatch, navigate, id]); // Добавляем id и navigate в зависимости

  // Добавим проверку на NaN перед рендерингом Board
  if (isNaN(boardId)) {
    // Можно вернуть null или компонент с сообщением об ошибке
    return <div>Invalid Board ID. Redirecting...</div>;
  }

  return (
    <Board onNavigateHome={() => navigate("/")} boardId={boardId} />
  );
}

export default BoardPage;