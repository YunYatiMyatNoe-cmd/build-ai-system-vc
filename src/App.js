import React, { useState } from 'react';
import './App.css';
import ResponseAnswer from './ResponseAnswer'; 
import SampleGraph from './SampleGraph.js';

const App = () => {
  // State to toggle between Graph and Chat
  const [isGraph, setIsGraph] = useState(true);

  // Handle button click to toggle between Graph and Chat
  const handleToggle = () => {
    setIsGraph(!isGraph); // Toggle the value of isGraph
  };

  return (
    <div className="app-container">
      
      {/* Toggle Button */}
      <div>
        <button onClick={handleToggle}>
          {isGraph ? 'Go to Chat' : 'Go to Graph'}
        </button>
      </div>

      {isGraph ? <SampleGraph/> : <ResponseAnswer/>}
    </div>
  );
};

export default App;
