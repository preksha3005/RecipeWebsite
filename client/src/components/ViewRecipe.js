import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar_login from "./Navbar_Login";
import "../style/viewrecipe.css"; // new CSS file

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.withCredentials = true;

export default function ViewRecipe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipes] = React.useState(null);
  const [userId, setUser] = React.useState("");

  React.useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/viewrecipe/${id}`);
        setRecipes(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipe();
  }, [id]);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/profile");
        console.log(res.data);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [id]);

  if (!recipe) {
    return <p>Loading recipe....</p>;
  }

  const handleLike = async (id) => {
    try {
      const res = await axios.post(`/likerecipe/${id}`);
      setRecipes((prev) =>
        prev.id === id
          ? {
              ...prev,
              likesCount: res.data.likesCount,
              likedByUser: res.data.likedByUser,
            }
          : recipe
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    const res = await axios.delete(`/deleterecipe/${id}`);
    setRecipes(null);
    navigate("/my-recipes");
  };

  return (
    <div>
      <Navbar_login />
      <div className="recipe-detail">
        <img src={recipe.imageUrl || "default.jpg"} alt={recipe.title} />
        <h1>{recipe.title}</h1>
        <p className="description">{recipe.description}</p>

        <h3>Ingredients</h3>
        <ul>
          {recipe?.ingredients?.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>

        <h3>Steps</h3>
        <ol>
          {recipe?.steps?.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        <p>
          <strong>Tags:</strong> {recipe.tags?.join(", ")}
        </p>
        <p>
          <strong>Author:</strong> {recipe.author?.name || "Unknown"}
        </p>

        <div className="actions">
          <button onClick={() => handleLike(recipe.id)}>
            {recipe.likedByUser ? "❤️" : "🤍"} {recipe.likesCount || 0}
          </button>
          {/*<button>💬 {r.commentsCount}</button>*/}
          {recipe.author._id === userId && (
            <div>
              <button
                onClick={() => handleDelete(recipe.id)}
                className="delete-btn"
              >
                🗑 Delete
              </button>

              <Link to={`/editrecipe/${recipe.id}`} className="edit-btn">
                ✏️ Edit
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
