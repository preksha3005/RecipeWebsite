import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/createrecipe.css";
import Navbar_login from "./Navbar_Login";

// axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.baseURL = "https://recipebackend-noat.onrender.com";
axios.defaults.withCredentials = true;

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    tags: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  // Handle text field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Submit recipe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("ingredients", formData.ingredients);
      data.append("steps", formData.steps);
      data.append("tags", formData.tags);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const res = await axios.post("/uploadrecipes", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Recipe created:", res.data);
      navigate("/my-recipes"); // redirect back to MyRecipes page
    } catch (err) {
      console.error("Full Axios error:", err);
      if (err.response) {
        alert(`Failed to create recipe: ${err.response.data.message}`);
      } else {
        alert("Failed to create recipe. Network error or server down.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar_login />
      <div className="create-recipe-container">
        <h2>Create a New Recipe</h2>
        <form onSubmit={handleSubmit} className="create-recipe-form">
          <input
            type="text"
            name="title"
            placeholder="Recipe Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients (comma separated)"
            value={formData.ingredients}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="steps"
            placeholder="Steps (comma separated)"
            value={formData.steps}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Create Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
