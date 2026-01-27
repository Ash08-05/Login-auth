import React, { useContext } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const {
    userData,
    backendUrl,
    setUserData,
    setIsLoggedin
  } = useContext(AppContent);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout')
      data.success && setIsLoggedin(false)
      data.success && setUserData(false)
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">

      {/* Logo */}
      <div className="flex items-center">
        <img
          src={assets.logo}
          alt="Logo"
          className="w-28 sm:w-32 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Right side */}
      <div>
        {userData ? (
          <div className="relative group cursor-pointer">

            {/* Avatar (first letter) */}
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
              {userData.name[0].toUpperCase()}
            </div>

            {/* Dropdown */}
            <div className="absolute top-full pt-2 right-0 hidden group-hover:block">
              <ul className="w-40 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden text-sm">
                {!userData.isAccountVerified && <li onClick={sendVerificationOtp} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Verify Email
                </li>}

                <li onClick={logout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                  LogOut
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="
              flex items-center gap-2 
              px-5 py-2 
              rounded-lg 
              bg-black text-white 
              font-medium 
              hover:bg-gray-800 
              transition duration-300
            "
          >
            Login
            <img
              src={assets.arrow_icon}
              alt=""
              className="w-4 h-4 invert"
            />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
