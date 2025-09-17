import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/homeuser.css";
import Navbar_login from "./Navbar_Login";
import axios from "axios";

// axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.baseURL = "https://recipebackend-noat.onrender.com";
axios.defaults.withCredentials = true;

export default function HomeUser() {
  const [recipes, setRecipes] = React.useState([]);
  const [ingredients, setIngredients] = React.useState("");
  const [tags, setTags] = React.useState("");
  const navigate = useNavigate();
  React.useEffect(() => {
    const fetchAll = async () => {
      if (!ingredients.trim() && !tags.trim()) {
        try {
          const res = await axios.get("/allrecipes");
          setRecipes(res.data);
          console.log(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchAll();
  }, [ingredients,tags]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/search", { ingredients, tags });
      setRecipes(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await axios.post(`/likerecipe/${id}`);
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === id
            ? {
                ...recipe,
                likesCount: res.data.likesCount,
                likedByUser: res.data.likedByUser,
              }
            : recipe
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar_login />

      {/* Search bar */}
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by ingredients (comma separated)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Recipe List */}
      <div className="recipes">
        {recipes.length > 0 ? (
          recipes.map((r) => (
            <div key={r.id} className="recipe-card">
              <img src={r.imageUrl || "default.jpg"} alt={r.title} />
              <h3>{r.title}</h3>
              <p>{r.description.substring(0, 60)}...</p>
              <div className="card-actions">
                <button onClick={() => handleLike(r.id)}>
                  {r.likedByUser ? "❤️" : "🤍"} {r.likesCount || 0}
                </button>
                {/*<button>💬 {r.commentsCount}</button>*/}
                <Link to={`/viewrecipe/${r.id}`} className="view-btn">
                  View Details
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
