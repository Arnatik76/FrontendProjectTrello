import React from 'react';

function Task({ content }) {
  return (
    <div className="card">
      {content}
    </div>
  );
}

export default Task;