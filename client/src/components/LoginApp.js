import React from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../style/login.css";
import Navbar from "./Navbar";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.withCredentials = true;

const LoginApp = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const navigate = useNavigate();

  const handle = (e) => {
  e.preventDefault();
  axios
    .post("/loginapp", { email, password })
    .then((result) => {
      // Check the 'status' property to determine success or failure
      if (result.data.status) {
        alert(result.data.message);
        navigate("/homeuser");
      } else {
        alert(result.data.message);
      }
    })
    .catch((err) => {
      // Handle network errors or other non-200 responses
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
      console.log(err);
    });

  setEmail("");
  setPassword("");
};

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>Log In</h2>
          <form onSubmit={handle}>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          <div className="extra-links">
            {/*<Link to="/forgotpass">Forgot Password?</Link>*/}
            <p>
              Don’t have an account? <Link to="/sign">Signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginApp;
