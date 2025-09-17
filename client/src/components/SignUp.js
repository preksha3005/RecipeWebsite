import React from "react";
import "../style/signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

export default function SignUp() {
  const [name, setn] = React.useState("");
  const [email, sete] = React.useState("");
  const [password, setp] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/sign", { name, email, password })
      .then((result) => {
        if (result.data.message) {
          console.log(result.data.message);
          alert(result.data.message);
        } else {
          console.log(result.data);
          alert(result.data);
        }
        if (result.data.status) navigate("/loginapp");
      })
      .catch((err) => {
        // Handle network errors or server issues
        console.error("Error during sign-up:", err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          alert(
            err.response.data.message || "An error occurred. Please try again."
          );
        } else if (err.request) {
          // The request was made but no response was received
          alert(
            "No response from server. Check your network or server status."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          alert("Request error. Please try again.");
        }
      });
  };

  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
  axios.defaults.withCredentials = true;
  return (
    <div>
    <Navbar/>
      <div className="auth-container">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={(e) => setn(e.target.value)}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={(e) => sete(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={(e) => setp(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>

        <p className="switch-text">
          Already have an account?{" "}
          <button className="link-btn" onClick={() => navigate("/loginapp")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
