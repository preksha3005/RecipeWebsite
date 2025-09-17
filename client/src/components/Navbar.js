import React from "react";
import '../style/navbar-home.css';
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <h1 className="logo"><Link to="/" className="nav-link">🍴 RecipeBook</Link></h1>
      <nav>
        <Link to="/loginapp" className="nav-link">
          Login
        </Link>
        <Link to="/sign" className="btn">
          Sign Up
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
