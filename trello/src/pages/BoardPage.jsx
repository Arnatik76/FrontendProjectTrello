import { useParams } from "react-router-dom";
import Board from "../components/Board";

function BoardPage() {
  const { id } = useParams();
  
  return <Board id={id} />;
}

export default BoardPage;
