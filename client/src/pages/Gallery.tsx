import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "../font.css";
import { sampleData } from "../data/data.ts";
import "./Gallery.css"
import LOGO from "../assets/wholeLOGO.png" 

type Product = {
  name: string;
  price: string;
  media: string;
  url: string;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulate loading from database or file
    setProducts(sampleData);

    // --- This is where you'd call your actual database (e.g. Supabase) ---
    // const { data, error } = await supabase.from('products').select('*')
    // setProducts(data);
  }, []);

  return (
      <div>
        <div className="gallery-header">
            <img src={LOGO} alt="Swipify Logo" className="wholelogo" />
            <Link to="/" className="back-button">← Back to Menu</Link>
        </div>
        <h1>Products You Liked</h1>
        <div className="gallery-container">
          {products.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gallery-item-link"
            >
              <div className="gallery-item">
                <img src={item.media} alt={item.name} className="gallery-image" />
                <p className="price">{item.price}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
};

export default App;
