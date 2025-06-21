import React, { useState, useEffect } from "react";
import "./App.css";
import { sampleData } from "./data/data.ts";

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
    <div className="gallery-container">
      {products.map((item, index) => (
        <div className="gallery-item" key={index}>
          <img src={item.media} alt={item.name} className="gallery-image" />
          <p className="price">{item.price}</p>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        </div>
      ))}
    </div>
  );
};

export default App;
