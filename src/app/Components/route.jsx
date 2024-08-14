"use client";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";

function Route({ current }) {
    const router = useRouter()
    // can be route or nav whatever
  const pages = [
    { title: "Dashboard", route: "/" },
    { title: "Generate", route: "/generate" },
    { title: "Flashcards", route: "/flashcards" },
    { title: "Admin", route: "/Admin" },
  ];

  const filteredPages = pages.filter((page) => page.route.toLowerCase() !== current.toLowerCase());

  const handleDashboard = (route) => {
    router.push(`${route}`);
}

  return (
    <>
      {filteredPages.map((page) => (
        <button
          key={page.title} // Adding a key for React's list rendering
          className="bg-black text-white text-[3vh] px-[2vh] py-[1vh] rounded-full capitalize"
          onClick={() => handleDashboard(page.route)}
        >
          {page.title}
        </button>
      ))}
    </>
  );
}

export default Route;
