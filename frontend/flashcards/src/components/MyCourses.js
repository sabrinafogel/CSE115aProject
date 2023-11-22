import React, { useEffect, useState } from "react";
// import { collection, getDocs, onSnapshot } from "firebase/firestore";
// import { db } from "./firebase_config";
import "./MyCourses.css";
import { UserAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";

function MyCourses() {
  const [courses, setCourses, searchedCourses] = useState([]);
  const { user } = UserAuth();

  var search = "";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/mycourses?email=${encodeURIComponent(
            user.email
          )}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const courses = await response.json();

        setCourses(courses);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCourses();
  }, [user.email]);

  const breakAll = (str) => {
    const words = str.split(" ");

    // Check each word
    for (let i = 0; i < words.length; i++) {
      if (words[i].length > 12) {
        return true;
      }
    }

    return false;
  };

  // Search feature for MyCourses
  const searchFeature = async(e) => {
    //setSearch(e.target.value);
    search = e.target.value.trim();
      if (search === ""){
        setCourses(searchedCourses);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/searchcourse?search=${encodeURIComponent(search)}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const searchedCourses = await response.json();
        setCourses(searchedCourses);
        
      } catch (error) {
        console.error("Error:", error);
      }
  };

  return (
    <div className="Course-wrapper">
      <div className="heading-wrapper">
        <h1 className="course-heading">Courses</h1>
        <div className="input-wrapper">
          <input className="search-input" placeholder="Search" onChange={searchFeature}></input>
          <Link to="/new-course">
            <button className="create-course">
              <FaPlus />
            </button>
          </Link>
        </div>
      </div>
      <ul className="scrollable-container">
        {courses.map((item, index) => (
          <Link key={item.id} to={`/courses/${item.id}`}>
            <li
              key={index}
              className={`item ${
                breakAll(item.name) ? "break-all" : ""
              } color-${index % 4}`}
            >
              <h1 className="Course-name">{item.name}</h1>
              <p className="Course-description">{item.description}</p>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default MyCourses;
