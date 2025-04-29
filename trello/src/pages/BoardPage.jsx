import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchBoardById } from "../store/slices/boardsSlice";
import { fetchAllTasks } from "../store/slices/tasksSlice";
import Board from "../components/Board";

function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const boardId = parseInt(id, 10);

  useEffect(() => {
    if (isNaN(boardId)) {
      console.error("Invalid board ID:", id);
      navigate('/'); 
      return; 
    }

    dispatch(fetchBoardById(boardId));
    dispatch(fetchAllTasks(boardId));

  }, [boardId, dispatch, navigate, id]);

  if (isNaN(boardId)) {
    return <div>Invalid Board ID. Redirecting...</div>;
  }

  return (
    <Board onNavigateHome={() => navigate("/")} boardId={boardId} />
  );
}

export default BoardPage;