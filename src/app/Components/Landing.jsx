"use client";

import { useEffect, useState } from "react";
import LoginPage from "../Components/login";
import SignUpPage from "../Components/signUp";

function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const landingCard = [
    {
      answer: "Geroge Washington.",
      question: "who is the first president of America?",
    },
    {
      answer: "pubg",
      question: "pubg or fortnite?",
    },
    {
      answer: "Diddy",
      question: "who is the BEST rapper?",
    },
  ];

  const basicPlan = [
    "Save up to 4 decks",
    "Create up to 10 flashcards per deck",
    "Generate flashcards with description or PDF",
    "Customize the deck's title and content",
    "Generate custom flashcards with manual input",
  ]

  const premiumPlan = [
    "Save an unlimited amount of decks",
    "Hold up to 40 cards in each deck",
    "Generate flashcards with description or pdf",
    "Generate multiple choice test quizzes up to 20 questions",
    "Share/import decks with other users",
    "3 one time use premium free trial code for 2 weeks",
  ]

  const closeModal = () => setIsModalOpen(false);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const slogan = {
    title: "Flashcards.",
    description: "but as if your best friend \npassed you their notes",
  };

  const randomCard = Math.floor(Math.random() * landingCard.length);

  return (
    <div className="bg-[#EBEBEB]">
      <div className="flex justify-around w-full items-center h-screen">
        <div className="flex flex-col gap-[4vh] items-start justify-start text-start w-[50vh]">
          <div className="flex flex-col">
            <h1 className="font-semibold text-[10vh]">{slogan.title}</h1>
            <h2 className="font-light text-[#989898] whitespace-pre-wrap text-[5vh]">
              {slogan.description}
            </h2>
          </div>

          <div className="flex gap-[2vh] w-full">
            <button
              onClick={() => openModal("login")}
              className="bg-[#111111] hover:bg-[#000000] transition-all ease-in-out text-[#FFFFFF] text-[3vh] font-semibold rounded-full p-[2vh] flex-1 box-border"
            >
              Sign up
            </button>
            <button
              onClick={() => openModal("signin")}
              className="bg-[#383838] hover:bg-[#929292] transition-all ease-in-out text-[#FFFFFF] text-[3vh] font-semibold rounded-full p-[2vh] flex-1 box-border"
            >
              Login
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[4vh] items-start justify-between text-start w-[50vh] relative h-full">
          <div className="hover:translate-y-[10vh] w-full h-[25%] bg-gradient-to-b from-[#111111] to-[#323232] rounded-b-[4vh] dropShadow transition-all ease-in-out -mt-[16vh] relative">
            <h1 className="text-white text-[4.5vh] text-start font-semibold pt-[8vh] w-[80%] m-auto">
              A: {landingCard[randomCard].answer}
            </h1>
            <h3 className="w-full text-right text-[3vh] absolute bottom-0 -mb-[4vh]">
              In an instant.
            </h3>
          </div>

          <div className="w-full h-[25%] bg-gradient-to-b from-[#111111] to-[#323232] rounded-t-[4vh] dropShadow relative landingCard">
            <h3 className="w-full text-left text-[3vh] absolute top-0 -mt-[4vh]">
              AI generated flashcards.
            </h3>
            <h1 className="text-white text-[4.5vh] text-start font-semibold pt-[8vh] w-[80%] m-auto">
              Q: {landingCard[randomCard].question}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-[#EBEBEB] flex justify-around w-full items-center h-screen relative z-10">
        <span className="flex flex-col gap-[4vh] items-start justify-start text-start w-[50vh]"></span>

        <div className="flex flex-col gap-[4vh] items-start justify-between text-start w-[50vh] relative h-full">
          <div className="w-full h-[25%] bg-gradient-to-b from-[#323232] to-[#111111] rounded-b-[4vh] dropShadow transition-all ease-in-out relative">
            <h1 className="text-white text-[4.5vh] text-start font-semibold pt-[8vh] w-[80%] m-auto">
              Subscriptions
            </h1>
            <h3 className="w-full text-right text-[3vh] absolute bottom-0 -mb-[4vh]">
              for more fun and more flashcards.
            </h3>
          </div>
        </div>

        <div className="flex justify-around w-full absolute bottom-0 z-0">
          <div className="bg-gradient-to-t from-[#D9D9D9] to-[#ffffff] rounded-t-[4vh] flex flex-col w-[60vh] p-[4vh] gap-[2vh] dropShadow">
            <div>
              <h2 className="text-[4vh] font-bold capitalize">basic</h2>
              <h3>for the newbies</h3>
            </div>

            <h2 className="text-[6vh] font-bold capitalize">Free</h2>

            <button className="w-[90%] m-auto bg-[#CACACA] border-[0.15vh] border-[#FFFFFF] text-[3vh] rounded-full py-[1.5vh] font-bold">
              forever
            </button>
            {basicPlan.map((plan) => (
              <li>{plan}</li>
            ))}
          
          </div>

          <div className="bg-gradient-to-t from-[#323232] to-[#111111] rounded-t-[4vh] flex flex-col w-[60vh] p-[4vh] gap-[2vh] dropShadow text-white">
            <div>
              <h2 className="text-[4vh] font-bold capitalize">premium</h2>
              <h3>for the more adventurous ones</h3>
            </div>

            <h2 className="text-[6vh] font-bold capitalize">$10</h2>

            <button className="w-[90%] m-auto bg-gradient-to-t from-[#323232] to-[#111111] border-[0.15vh] border-[#FFFFFF] text-[3vh] rounded-full py-[1.5vh] font-bold">
              subscribe
            </button>
            {premiumPlan.map((plan) => (
              <li>{plan}</li>
            ))}
          
          </div>
        </div>
      </div>

      {/* Modal */}
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

export default Landing;
