import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import GALLERY_LOGO from "./assets/wholeLOGO.png";
import { sampleData } from "./data/data"; // adjust if needed
import "./App.css";
import "./pages/Gallery.css";
import "./font.css";

const api_url = 'http://localhost:8080'
// const api_url = 'https://swipify-production.up.railway.app'
type Product = {
  Name_Of_Product: string;
  Price: string;
  Media_URL: string;
  Ecommerce_URL: string;
};

const getUserLikedProducts = async (uid: string) => {
  const response = await fetch(`${api_url}/db/getliked`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch liked products");
  }
  return response.json();
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      // setProducts(sampleData);
      // console.log(session.user)
      if (session.user) {
        const id = session.user.id

        getUserLikedProducts(id).then((data)=>{
          if (data.products)
            console.log(data.products)
            setProducts(data.products)
        })

        localStorage.setItem('swipify-id', id)
      } else {
        localStorage.setItem('swipify-id', '')
      }
    }
  }, [session]);

  if (!session) {
    return (
      <div className="App">
        <div className="auth-container">
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="gallery-header1">
        <img
          src={GALLERY_LOGO}
          alt="Swipify Gallery Logo"
          className="wholelogo"
        />
        <h1>Welcome!</h1>
      </div>

      <hr className="divider" />

      <div className="gallery-header2">
        <h1>Products You Liked</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setSession(null); // manually clear session right away
          }}
        >
          Sign Out
        </button>{" "}
      </div>

      <div className="gallery-container">
        {products.map((item, index) => (
            <a
            key={index}
            href={item.Ecommerce_URL.startsWith('http') ? item.Ecommerce_URL : `https://${item.Ecommerce_URL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gallery-item-link"
            >
            <div className="gallery-item">
              <img src={item.Media_URL} alt={item.Name_Of_Product} className="gallery-image" />
              <div className="name">{item.Name_Of_Product}</div>
              <p className="price">{item.Price}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
