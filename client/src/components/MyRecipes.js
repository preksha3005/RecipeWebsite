import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/myrecipes.css";
import Navbar_login from "./Navbar_Login";
import axios from "axios";

// axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.baseURL = "https://recipebackend-noat.onrender.com";
axios.defaults.withCredentials = true;

export default function MyRecipes() {
  const [myrecipes, setRecipes] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const res = await axios.get("/myrecipes");
        setRecipes(res.data);
      } catch (err) {
        console.error("Error fetching my recipes:", err);
      }
    };
    fetchMyRecipes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    const res = await axios.delete(`/deleterecipe/${id}`);
    setRecipes((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div>
      <Navbar_login />

      <div className="my-recipes-container">
        <div className="header">
          <h2>My Recipes</h2>
          <button
            className="create-btn"
            onClick={() => navigate("/createrecipe")}
          >
            + Create Recipe
          </button>
        </div>
      </div>

      {/* Recipe List */}
      <div className="recipes">
        {myrecipes.length > 0 ? (
          myrecipes.map((r) => (
            <div key={r._id} className="recipe-card">
              <img src={r.imageUrl || "default.jpg"} alt={r.title} />
              <h3>{r.title}</h3>
              <p>{r.description.substring(0, 60)}...</p>
              <div className="card-actions">
                <button>❤️ {r.likes.length}</button>
                {/* <button>💬 {r.comments.length}</button>*/}
                <Link to={`/viewrecipe/${r._id}`} className="view-btn">
                  View Details
                </Link>

                {/* 🔴 Delete button only in MyRecipes */}
                <button
                  onClick={() => handleDelete(r._id)}
                  className="delete-btn"
                >
                  🗑
                </button>

                <Link to={`/editrecipe/${r._id}`} className="delete-btn">
                  ✏️
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>No recipes found</p>
        )}
      </div>
    </div>
  );
}
