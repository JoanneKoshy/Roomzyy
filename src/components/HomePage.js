import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css"; // ✅ Import CSS for styling

// ✅ Import Lottie and the animation JSON
import Lottie from "lottie-react";
import Cute from "../assets/Cute.json"; // ✅ Make sure this path is correct

const Homepage = () => {
  return (
    <div className="homepage">
      {/* ✅ Lottie animation on top */}
      <div className="lottie-wrapper">
        <Lottie animationData={Cute} loop={true} style={{ height: 300 }} />
      </div>
      <h1>Roomzyyyyyy</h1>
      <p>Start a room. Summon the homies. Chaos mode: activated.</p>

      <div className="button-container">
        <Link to="/signup">
          <button className="signup-button">Sign Up</button>
        </Link>
        <Link to="/login">
          <button className="login-button">Log In</button>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
