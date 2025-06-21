import React from "react";
import "./App.css";

const App: React.FC = () => {
  // Generate 40 blank items (10 rows x 4 columns)
  const totalImages = 40;
  const images = Array.from({ length: totalImages }, (_, i) => i);

  return (
    <div className="gallery-container">
      {images.map((id) => (
        <div className="gallery-item" key={id}>
          <div className="placeholder-box" />
          <p>Price: $0</p>
          <a href="#" target="_blank" rel="noopener noreferrer">
            View Full Image
          </a>
        </div>
      ))}
    </div>
  );
};

export default App;
