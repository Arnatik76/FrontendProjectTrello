import { useState } from "react";
import Column from "./Column";

function Board({ id }) {
  const [columns] = useState([
    { id: 1, title: "To Do", cards: ["Task 1", "Task 2", "Task 3"] },
    { id: 2, title: "In Progress", cards: ["Task 4", "Task 5"] },
    { id: 3, title: "Done", cards: ["Task 6"] },
  ]);

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>Доска: {id}</h1>
      </div>

      <div className="board-content">
        {columns.map(column => (
          <Column 
            key={column.id} 
            title={column.title} 
            cards={column.cards} 
          />
        ))}
        <div className="add-column">
          <button className="add-column-button">
            + Add another column
          </button>
        </div>
      </div>
    </div>
  );
}

export default Board;