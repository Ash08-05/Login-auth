import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-black/30"
      style={{ backgroundImage: "url('/bg_img.png')" }}>
      <Navbar />
      <Header />
    </div>
  )
}

export default Home
