import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchBoardById } from "../store/slices/boardsSlice";
import { fetchColumns } from "../store/slices/columnsSlice";
import { fetchAllTasks } from "../store/slices/tasksSlice";
import Board from "../components/Board";

function BoardPage() {
  const { id } = useParams();
  const boardId = parseInt(id, 10);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
      dispatch(fetchAllTasks(boardId));
    }
  }, [boardId, dispatch]);

  return (
    <Board onNavigateHome={() => navigate("/")} boardId={boardId} />
  );
}

export default BoardPage;