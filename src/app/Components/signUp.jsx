"use client";
import { useState } from "react";
import { auth } from "../../firebase/config"
import Image from "next/image";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

function SignUpPage({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const provider = new GoogleAuthProvider();

  const handleGoogle = (e) => {
    e.preventDefault();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        onClose()
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error("Google Sign-In Error:", errorMessage);
        setError("Google Sign-In Error");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password).catch((error) => {
      const errorMessage = error.message;
      setError("Invalid Email or Password");
    });
  };

  return (
    <div className="relative bg-gradient-to-b from-[#111111] to-[#323232] shadowStroke dropShadow w-[60vh] flex flex-col justify-center items-center gap-[4vh] py-[2vh] rounded-[5vh]">
      <h2 className="text-[5vh] text-center text-white">Sign up</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-around w-full gap-[4vh]"
      >
        <div className="flex justify-around gap-[4vh] px-[4vh]">
          <div className="flex flex-col gap-[2vh] w-1/2">
            <div className="flex flex-col gap-[1vh]">
              <label
                htmlFor="email"
                className="block lowercase text-white text-[2vh]"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                placeholder="your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                className="w-full rounded-[5vh] pl-[1.5vh] py-[0.5vh] text-[2vh]"
              />
            </div>
            <div className="flex flex-col gap-[1vh] ">
              <label htmlFor="password" className="block text-white text-[2vh]">
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                placeholder="your password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                className="w-full rounded-[5vh] pl-[1.5vh] py-[0.5vh] text-[2vh] "
              />
              {error ? (
                <div className="text-red-600">{error}</div>
              ) : (
                <div className="opacity-1 opacity-0">
                  hiii this is hiddennnn hiii
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start w-1/2 gap-[1vh]">
            <label
              htmlFor="gmail"
              className="block text-white text-[2vh] lowercase"
            >
              or sign up with:
            </label>
            <button onClick={handleGoogle} className="">
              <Image
                width={100}
                height={100}
                className="w-[4vh]"
                src="/gmail.png"
                alt=""
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full m-auto gap-[1vh]">
          <button
            type="submit"
            className="bg-[#FFFFFF] text-[3vh] font-semibold px-[2vh] py-[1vh] lowercase text-[#121212] rounded-full hover:bg-[#383838] transition ease-in-out"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
