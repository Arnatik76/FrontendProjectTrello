import React from 'react';
// import './Task.css';

function Task({ content }) {
  return (
    <div className="card">
      {content}
    </div>
  );
}

export default Task;