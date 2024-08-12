"use client";
import { useState } from "react";
import { auth } from "../../firebase/config"
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
    <div className="relative bg-white p-8 rounded-lg shadow-lg">
      <button
        className="absolute top-2 right-2 text-red-500 text-2xl cursor-pointer hover:text-red-600 hover:scale-110 transition ease-in-out"
        onClick={onClose}
      >
        X
      </button>
      <h2 className="text-3xl mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        {error && (
          <div className="text-red-600 text-center text-sm mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded mb-2 w-32 hover:bg-green-600 transition ease-in-out"
          >
            Submit
          </button>
          <button
            onClick={handleGoogle}
            className="bg-blue-500 text-white py-2 px-4 rounded w-32 flex items-center justify-center hover:bg-blue-600 transition ease-in-out"
          >
            <i className="fab fa-google mr-2"></i> Sign up with Google
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
