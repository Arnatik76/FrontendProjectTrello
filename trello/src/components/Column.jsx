import React from 'react';
import Task from "./Task";

function Column({ title, cards }) {
  return (
    <div className="column">
      <div className="column-header">
        {title}
      </div>
      <div className="column-cards">
        {cards.map((card, index) => (
          <Task key={index} content={card} />
        ))}
      </div>
      <button className="add-card-button">
        + Add a card
      </button>
    </div>
  );
}

export default Column;