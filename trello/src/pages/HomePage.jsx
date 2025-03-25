import { Link } from "react-router-dom";

function HomePage() {
  const boards = [
    { id: 1, name: "Доска 1" },
    { id: 2, name: "Доска 2" },
  ];

  return (
    <div className="home-container">
      <h1>Мои Доски</h1>
      <ul className="boards-list">
        {boards.map((board) => (
          <li key={board.id} className="board-item">
            <Link to={`/board/${board.id}`}>{board.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
