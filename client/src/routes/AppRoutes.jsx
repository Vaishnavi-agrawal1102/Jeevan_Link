import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Register from "../pages/Register/Register.jsx";
import AnonymousSOS from "../pages/AnonymousSOS.jsx";

import VictimDashboard from "../pages/VictimDashboard/VictimDashboard.jsx";
import VolunteerDashboard from "../pages/VolunteerDashboard/VolunteerDashboard.jsx";
import NGODashboard from "../pages/NGODashboard/NGODashboard.jsx";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard.jsx";

import ReliefCamp from "../pages/ReliefCamp/ReliefCamp.jsx";
import Resources from "../pages/Resources/Resources.jsx";
import Profile from "../pages/Profile/Profile.jsx";
import Chat from "../pages/Chat/Chat.jsx";
import About from "../pages/About/About.jsx";
import Contact from "../pages/Contact/Contact.jsx";

import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute.jsx";

const AppRoutes = () => (
  <Routes>
    {/* Public pages */}
    <Route path="/" element={<Home />} />
    <Route path="/sos" element={<AnonymousSOS />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/relief-camps" element={<ReliefCamp />} />
    <Route path="/resources" element={<Resources />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />

    {/* Protected pages */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />

    {/* Victim dashboard */}
    <Route
      path="/victim"
      element={
        <ProtectedRoute roles={["victim"]}>
          <VictimDashboard />
        </ProtectedRoute>
      }
    />

    {/* Volunteer dashboard */}
    <Route
      path="/volunteer"
      element={
        <ProtectedRoute roles={["volunteer"]}>
          <VolunteerDashboard />
        </ProtectedRoute>
      }
    />

    {/* NGO dashboard */}
    <Route
      path="/ngo"
      element={
        <ProtectedRoute roles={["ngo"]}>
          <NGODashboard />
        </ProtectedRoute>
      }
    />

    {/* Admin dashboard */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Fallback */}
    <Route path="*" element={<Home />} />
  </Routes>
);


export default AppRoutes;
