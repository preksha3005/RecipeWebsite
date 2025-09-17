import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../style/navbar-login.css'

// axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.baseURL = "https://recipebackend-noat.onrender.com";
axios.defaults.withCredentials = true;

const Navbar_login = () => {
  const [initial, seti] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    axios
      .get("/initial")
      .then((res) => seti(res.data.initial))
      .catch((err) => console.log("Error"));
  }, []);

  const handlelog = () => {
    axios
      .get("/logout")
      .then((res) => {
        if (res.data.status) {
          navigate("/loginapp");
          console.log(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
     <nav className="navbar">
        <div className="nav-left">
          <a href="/homeuser">Home</a>
          <a href="/my-recipes">My Recipes</a>
        </div>
        <div className="nav-right">
          <span className="user-initial">{initial}</span>
          <button onClick={handlelog}>Logout</button>
        </div>
      </nav>
  );
};

export default Navbar_login;
