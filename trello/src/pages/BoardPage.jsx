import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchBoardById } from "../store/slices/boardsSlice";
import { fetchColumns } from "../store/slices/columnsSlice";
import Board from "../components/Board";

function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Загружаем данные доски при монтировании компонента
    dispatch(fetchBoardById(id));
    // Загружаем колонки для доски
    dispatch(fetchColumns(id));
  }, [id, dispatch]);

  return (
    <Board onNavigateHome={() => navigate("/")} boardId={id} />
  );
}

export default BoardPage;