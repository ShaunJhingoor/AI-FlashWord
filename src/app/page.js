"use client";

import { useEffect, useState } from "react";
import LoginPage from "./Components/login";
import SignUpPage from "./Components/signUp";
import { selectUser } from "../store/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config"; // Ensure this import is correct

function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const user = useSelector(selectUser)
  const dispatch = useDispatch();
  console.log(user);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      signOut(auth)
        .then(() => {
          dispatch(setUser(null));
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  };

  const handleSubmit = async () => {
    const checkoutSession = await fetch("/api/checkout", {});
  }


  return (
    <div className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 w-screen h-screen m-0 p-0 flex flex-col items-center justify-center">
      {user?.currentUser ? (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl mb-4 font-bold text-white">
            Welcome, {user.currentUser.email}!
          </h1>
          <div className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
            <div className="flex flex-col text-white">
              <h1 className="font-bold text-[4vh]">Pricing</h1>
              <div className="flex w-full justify-between items-center">
                <div className="flex flex-col gap-[1vh]">
                  <h1 className="text-[3vh]">basic</h1>
                  <button className="bg-[#d64040] p-[2vh] rounded-full">choose basic</button>
                </div>
                <div className="flex flex-col gap-[1vh]">
                  <h1 className="text-[3vh]">professional</h1>
                  <button className="bg-[#d64040] p-[2vh] rounded-full">choose professional</button>
                </div>
              </div>
            </div>
          </div>
          <button
              onClick={handleSignOut}
              className="py-2 px-6 text-white bg-red-600 rounded-lg transition-transform transform hover:scale-105"
            >
              Sign Out
            </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
            <h1 className="text-4xl mb-4 font-bold text-white opacity-0 animate-[writeText_2s_forwards]">
              Welcome to AI FlashWorld
            </h1>
            <p className="text-xl mb-8 text-white opacity-0 animate-[writeText_2s_1s_forwards]">
              AI FlashWorld makes review cards and questions for you to study!
              Upload your pdf and start studying right away!
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => openModal("signup")}
                className="py-2 px-6 text-white bg-green-500 rounded-lg transition-transform transform hover:scale-105"
              >
                Sign Up
              </button>
              <button
                onClick={() => openModal("login")}
                className="py-2 px-6 text-white bg-blue-600 rounded-lg transition-transform transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 p-8 rounded-3xl shadow-2xl max-w-lg w-11/12"
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "login" ? (
              <LoginPage onClose={closeModal} />
            ) : (
              <SignUpPage onClose={closeModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
