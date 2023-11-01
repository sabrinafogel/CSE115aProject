import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./components/AuthContext";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Register from "./pages/Register";
import NewCourse from "./pages/NewCourse";
import NewSet from "./pages/NewSet";
import Profile from "./pages/Profile";
import "./App.css";
import CoursePage from "./pages/CoursePage";
import NewChapter from "./pages/NewChapter";
import EditSet from "./pages/EditSet";

function App() {
  return (
    <div className="App">
      <AuthContextProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<Home />} />
          <Route path="/register-account" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/new-course" element={<NewCourse />} />
          <Route path="/new-set" element={<NewSet />} />
          <Route path="/courses/:courseid" element={<CoursePage />} />
          <Route path="/new-chapter/:courseid" element={<NewChapter />} />
          <Route
            path="/courses/:courseid/:index/new-set"
            element={<NewSet />}
          />
          <Route
            path="/courses/:courseid/:index/:setindex"
            element={<EditSet />}
          />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
