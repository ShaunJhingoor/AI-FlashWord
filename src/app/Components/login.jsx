"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {auth} from "../../firebase/config"

function LoginPage({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const provider = new GoogleAuthProvider();

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      const errorMessage = error.message;
      setError("Invalid Email or Password");
      console.log(errorMessage);
    });
  };

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

  const handlePasswordReset = () => {
    const email = prompt('Please Enter Email');
    sendPasswordResetEmail(auth, email);
    alert('Email sent. Check inbox for password reset');
  };

  return (
    <div className="relative bg-white p-8 rounded-lg shadow-lg">
      <button className="absolute top-2 right-2 text-red-500 text-2xl cursor-pointer hover:text-red-600 hover:scale-110 transition ease-in-out" onClick={onClose}>
        X
      </button>
      <h2 className="text-3xl mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center">
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
          <div className="text-red-600 mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col items-center mb-4">
          <button type="submit" className="bg-green-500 text-white w-32 py-2 rounded mb-2 hover:bg-green-600 transition ease-in-out">
            Submit
          </button>
          <button onClick={handleGoogle} className="bg-blue-500 text-white w-32 py-2 rounded flex items-center justify-center hover:bg-blue-600 transition ease-in-out">
            <i className="fab fa-google mr-2"></i> Sign in with Google
          </button>
        </div>
        <p className="text-center text-blue-600 text-sm cursor-pointer underline hover:text-blue-700 transition ease-in-out" onClick={handlePasswordReset}>
          Forgot Password
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
