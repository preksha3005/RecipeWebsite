import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/editrecipe.css";
import Navbar_login from "./Navbar_Login";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.withCredentials = true;

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = React.useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
    tags: "",
    image: null,
  });
  const [loading, setLoading] = React.useState(false);

  // Handle text field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    setRecipe({ ...recipe, image: e.target.files[0] });
  };

  React.useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/viewrecipe/${id}`);
        setRecipe({
          title: res.data.title,
          description: res.data.description,
          ingredients: res.data.ingredients.join(","),
          steps: res.data.steps.join(","),
          tags: res.data.tags.join(","),
          image: null,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", recipe.title);
      data.append("description", recipe.description);
      data.append("ingredients", recipe.ingredients);
      data.append("steps", recipe.steps);
      data.append("tags", recipe.tags);
      if (recipe.image) {
        data.append("image", recipe.image);
      }

      const res = await axios.put(`/editrecipe/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Recipe updated:", res.data);
      navigate("/my-recipes"); // redirect back to MyRecipes page
    } catch (err) {
      console.error("Error uploading recipe:", err);
      alert("Failed to update recipe. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar_login />
      <div className="edit-recipe-container">
        <h2>Edit Recipe</h2>
        <form className="edit-recipe-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={recipe.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients (comma separated)"
            value={recipe.ingredients}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="steps"
            placeholder="Steps (comma separated)"
            value={recipe.steps}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={recipe.tags}
            onChange={handleChange}
          />
          <div className="image-input-container">
            <span>Recipe Image:</span>
            <input type="file" name="image" onChange={handleImageChange} />
          </div>
          <button type="submit">Update Recipe</button>
        </form>
      </div>
    </div>
  );
}
