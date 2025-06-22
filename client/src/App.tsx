import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import GALLERY_LOGO from "./assets/wholeLOGO.png";
import { sampleData } from "./data/data"; // adjust if needed
import "./App.css";
import "./pages/Gallery.css";
import "./font.css";

type Product = {
  name: string;
  price: string;
  media: string;
  url: string;
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      setProducts(sampleData);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="App">
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="gallery-header1">
          <img src={GALLERY_LOGO} alt="Swipify Gallery Logo" className="wholelogo" />
          <h1>Welcome, Stephen!</h1>
      </div>
      
      <hr className="divider" />

      <div className="gallery-header2">
          <h1>Products You Liked</h1>
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
      
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
}

export default App;
