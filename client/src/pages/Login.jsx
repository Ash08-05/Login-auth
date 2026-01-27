import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const onSubmitHandler = async (e) => {
    e.preventDefault(); 
    try {
      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password })
        if (data.success) {
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password })
        if (data.success) {
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(data.message)
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-400">

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">

        <div className="flex justify-center mb-6">
          <img src={assets.logo} alt="Logo" className="w-28 object-contain" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {state}
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2">
          Welcome! Please enter your details
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 text-center">

          <h2 className="text-lg font-semibold text-gray-800">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {state === "Sign Up"
              ? "Create your account to get started"
              : "Login to access your account"}
          </p>

          <form onSubmit={onSubmitHandler} className="mt-6 space-y-4">

            {state === "Sign Up" && (
              <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus-within:border-indigo-500">
                <img src={assets.person_icon} alt="" className="w-5 h-5 opacity-60" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter Full Name"
                  required
                  className="w-full outline-none bg-transparent text-sm"
                />
              </div>
            )}

            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus-within:border-indigo-500">
              <img src={assets.mail_icon} alt="" className="w-5 h-5 opacity-60" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter Email"
                required
                className="w-full outline-none bg-transparent text-sm"
              />
            </div>

            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus-within:border-indigo-500">
              <img src={assets.lock_icon} alt="" className="w-5 h-5 opacity-60" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter Password"
                required
                className="w-full outline-none bg-transparent text-sm"
              />
            </div>

            <p
              onClick={() => navigate("/reset-password")}
              className="text-sm text-indigo-600 hover:underline cursor-pointer text-right"
            >
              Forgot Password?
            </p>

            <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:opacity-90 transition">
              {state}
            </button>
          </form>

          {state === "Sign Up" ? (
            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-indigo-600 font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-indigo-600 font-medium cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
