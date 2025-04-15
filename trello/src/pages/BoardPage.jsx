import { useParams, useNavigate } from "react-router-dom";
import { BoardProvider } from "../contexts/BoardContext";
import Board from "../components/Board";

function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <BoardProvider boardId={id}>
      <Board onNavigateHome={() => navigate("/")} />
    </BoardProvider>
  );
}

export default BoardPage;