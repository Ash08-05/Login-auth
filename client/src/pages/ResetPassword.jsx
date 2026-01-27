import React, { useState, useRef, useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'
const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [newPassword, setnewPassword] = useState("")
  const [isEmailsent, setisEmailsent] = useState("")
  const [otp, setOtp] = useState(0)
  const [isOtpSubmitted, setisOtpSubmitted] = useState(false)

  const inputRefs = useRef([]);
  const { backendUrl } = useContext(AppContent)
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
  }

  const onsubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email })
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setisEmailsent(true)
    } catch (error) {
      toast.error(error.message)
    }
  }


  const onsubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value)
    setOtp(otpArray.join(''))
    setisOtpSubmitted(true)
  }



  const onsubmitPassword = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword })
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }



  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-400">
      <img
        src={assets.logo}
        alt="Logo"
        className="w-28 object-contain drop-shadow-md"
      />

      {/* Email id */}
      {
        !isEmailsent &&

        <form onClick={onsubmitEmail} className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-10 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Reset Password
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            Enter the Registered Email
          </p>
          <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus-within:border-indigo-500">
            <img src={assets.mail_icon} alt="" className="w-5 h-5 opacity-60" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" placeholder="Enter Email" required className="w-full outline-none bg-transparent text-sm" />
          </div>
          <button className="mt-6 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:opacity-90 transition">
            Submit
          </button>
        </form>

      }

      {/* OTP form */}

      {
        !isOtpSubmitted && isEmailsent &&

        <form
          onSubmit={onsubmitOTP}
          className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-10 text-center"
        >
          <h1 className="text-2xl font-semibold text-gray-800">
            Reset Password otp
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
            Submit
          </button>
        </form>
      }

      {/* Password from */}

      {isOtpSubmitted && isEmailsent &&
        <form onSubmit={onsubmitPassword} className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-10 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Reset Password
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            Enter the New Password below
          </p>
          <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus-within:border-indigo-500">
            <img src={assets.lock_icon} alt="" className="w-5 h-5 opacity-60" />
            <input
              value={newPassword}
              onChange={(e) => setnewPassword(e.target.value)}
              type="password" placeholder="Enter New Password" required className="w-full outline-none bg-transparent text-sm" />
          </div>
          <button className="mt-6 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:opacity-90 transition">
            Submit
          </button>
        </form>
      }
    </div>
  )
}

export default ResetPassword
