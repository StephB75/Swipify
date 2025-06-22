import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <div className="landing-container">
      <img src="/banner.png" alt="Banner" className="banner-image" />
      <div className="hero-section">
        <h1>Discover, Swipe, and Save Your Favorite Products</h1>
        <p>
          Swipe through curated products and build your ultimate wishlist
          effortlessly.
        </p>
        <button className="cta-button" onClick={handleSignIn}>
          Get Started
        </button>
      </div>

      <footer className="footer">© 2025 Swipify. All rights reserved.</footer>
    </div>
  );
};

export default Landing;
