import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const { backendUrl, setUserData ,isLoggedin ,userData } = useContext(AppContent);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  axios.defaults.withCredentials = true;

  const handleInput = (e, index) => {
    if (e.target.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const otp = inputRefs.current.map((el) => el.value).join("");

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { otp }
      );

      if (data.success) {
        toast.success(data.message);

        const userRes = await axios.get(
          `${backendUrl}/api/user/data`
        );

        setUserData(userRes.data.userData);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Verification failed"
      );
    }
  }

  useEffect(() =>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  },[isLoggedin,userData])



  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-400">

      <img
        src={assets.logo}
        alt="Logo"
        className="w-28 object-contain drop-shadow-md"
      />

      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-10 text-center"
      >
        <h1 className="text-2xl font-semibold text-gray-800">
          Email Verify OTP
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          Enter the 6-digit code sent to your email.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              required
              ref={(el) => (inputRefs.current[index] = el)}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-11 h-14 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          ))}
        </div>

        <button className="mt-8 w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-md hover:shadow-xl active:scale-95 transition">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
