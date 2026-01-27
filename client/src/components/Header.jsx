import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";

const Header = () => {
    const {userData} = useContext(AppContent)
  return (
    <header className="w-full min-h-[80vh] flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-10 bg-gray-50">
      
      {/* Text Section */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Hey {userData ? userData.name : 'Developer'} !
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          Secure authentication with OTP verification and JWT-based access.
        </p>

        <button className="mt-6 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition">
          Get Started
        </button>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
        <img
          src={assets.header_img}
          alt="Header"
          className="w-full max-w-md object-contain"
        />
      </div>

    </header>
  );
};

export default Header;
