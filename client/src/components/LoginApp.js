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
        if (result.data.message) {
          alert(result.data.message);
        } else {
          alert(result.data);
        }
        if (result.data.status) navigate("/homeuser");
      })
      .catch((err) => console.log(err));

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
