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
      {/* Navbar */}
      <div className="navbar">
        <a href="/">
          <img src="/LOGO.png" alt="Swipify Logo" className="logo-img" />
        </a>
        <div className="navbar-links">
          <a href="/auth">Login</a>
        </div>
      </div>

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

      {/* Rest of landing page */}
      <img src="/banner.png" alt="Banner" className="banner-image" />

      <footer className="footer">© 2025 Swipify. All rights reserved.</footer>
    </div>
  );
};

export default Landing;
