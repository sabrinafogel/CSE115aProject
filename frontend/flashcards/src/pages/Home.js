import React from "react";
import "./Home.css";
import Navbar from "../components/Navbar";
import { UserAuth } from "../components/AuthContext";
import MyCourses from "../components/MyCourses";
import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";

function Home() {
  const { user } = UserAuth();

  return (
    <div>
      <Navbar />
      <div className="Home">
        {user === null ? (
          <div className="heading">Welcome</div>
        ) : (
          <div>
            <div className="heading-wrapper">
              <h1 className="course-heading">My courses</h1>
              <div className="input-wrapper">
                <input className="search-input" placeholder="Search"></input>
                <Link to="/new-course">
                  <button className="create-course">
                    <FaPlus />
                  </button>
                </Link>
              </div>
            </div>
            <div>
              <MyCourses />
            </div>
          </div>
          
        )}
      </div>
    </div>
  );
}

export default Home;