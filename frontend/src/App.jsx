import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import "./App.css";

function App() {
  return (
    <div className="pt-10 min-h-screen bg-gray-100 flex flex-col justify-center items-center max-w-screen">
      <h1 className="text-4xl font-semibold text-blue-500 mb-8 text-center">
        Price Tracker
      </h1>
      <div className="md:space-x-5 mb-5 flex flex-col md:flex-row items-center justify-center">
        <a
          href="/login"
          className="mb-3 text-white bg-blue-500 hover:bg-green-700 px-4 py-2 rounded-md  w-full sm:w-auto "
        >
          Login
        </a>
        <a
          href="/dashboard"
          className="mb-3 text-white bg-blue-500 hover:bg-green-700 px-4 py-2 rounded-md  w-full sm:w-auto"
        >
          Dashboard
        </a>
        <a
          href="/signup"
          className="mb-3 text-white bg-blue-500 hover:bg-green-700 px-4 py-2 rounded-md  w-full sm:w-auto "
        >
          Signup
        </a>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
