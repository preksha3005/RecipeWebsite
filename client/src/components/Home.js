import React from "react";
import "../style/home.css";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <div className="homepage">
      {/* Navbar 
      <header className="navbar">
        <h1 className="logo">🍴 RecipeBook</h1>
        <nav>
          <Link to="/loginapp" className="nav-link">
            Login
          </Link>
          <Link to="/sign" className="btn">
            Sign Up
          </Link>
        </nav>
      </header>*/}
      <Navbar/>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-text">
          <h2>Discover & Share Amazing Recipes</h2>
          <p>
            Explore a world of delicious recipes, learn new cooking techniques,
            and share your own creations with food lovers around the globe.
          </p>
          <div className="hero-buttons">
            <Link to="/sign" className="btn">
              Get Started
            </Link>
            <Link to="/loginapp" className="btn-secondary">
              Login
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://img.freepik.com/free-photo/top-view-fresh-tomatoes-with-seasonings-black_140725-104140.jpg"
            alt="Food"
          />
        </div>
      </main>
    </div>
  );
}
