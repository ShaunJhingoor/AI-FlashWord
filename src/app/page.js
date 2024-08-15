"use client";

import { useEffect, useState } from "react";
import LoginPage from "./Components/login";
import SignUpPage from "./Components/signUp";
import { selectUser } from "../store/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config"; 
import { getCheckoutUrl, getPortalUrl } from "./account/stripePayment";
import { useRouter } from "next/navigation";
import { getPremiumStatus } from "./account/PremiumStatus";
import DecksPage from "./dashboard/page";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/config"; 
//Almost Everything in this page is going to go into a navbar component
function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [status, setStatus] = useState("")
  const user = useSelector(selectUser)
  const dispatch = useDispatch();
  const router = useRouter()

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


  const resetRequestNumber = async (userId) => {
    try {
      const userDocRef = doc(firestore, "Users", userId);
      await updateDoc(userDocRef, { number: 5 });
      console.log("Request number reset successfully.");
    } catch (error) {
      console.error("Error resetting request number:", error);
    }
  };
  
  const checkAndResetPremiumStatus = async (userId) => {
    if (status) {
      await resetRequestNumber(userId);
    }
  };

  const handleUpgradeToPremium = async () => {
  const priceId = "price_1Pnnf7DM3EY2E0WOjkZvgNbV";
  try {
    const checkoutUrl = await getCheckoutUrl(priceId, user?.currentUser.id);
    // Redirect to Stripe Checkout
    router.push(checkoutUrl);
    
   
  
    await checkAndResetPremiumStatus(user?.currentUser.id);
    
  } catch (error) {
    console.error("Error upgrading to premium:", error);
  }
};

  const handleManageSubscription = async() => {
    const portalUrl = await getPortalUrl(user)
    router.push(portalUrl)
  }

  // https://dashboard.stripe.com/test/settings/billing/portal need to go here to set up portal link have to redo this
  //PLEASE DO NOT GET RID OF THIS !!
  useEffect(() => {
    const checkPremiumStatus = async() => {
      const premiumStatus = await getPremiumStatus(user)
      console.log(premiumStatus)
      setStatus(premiumStatus ? "Premium" : "Basic");
    }
    if (user?.currentUser) {
      checkPremiumStatus();
    }
  }, [user])

  // const handleCheckout = async () => {
  //   console.log('hitting checkout')
  //   const checkoutSession = await fetch("/api/checkout_session", {
  //     method: 'POST',
  //     headers: {
  //       origin: 'http://localhost:3000'
  //     }
  //   });

  //   if (checkoutSession.statusCode === 500) {
  //     console.error(checkoutSession.message)
  //     return
  //   }
  //   const checkoutSessionJson = await checkoutSession.json()
  //   console.log('checkoutSession: ', checkoutSessionJson.id)
  //   const stripe = await getStripe();
  //   const {error} = await stripe.redirectToCheckout({
  //     sessionId: checkoutSessionJson.id
  //   })

  //   if (error){
  //     console.warn(error.message)
  //   }

  // }



  return (
    <>
      <div className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 w-screen min-h-screen m-0 p-0 flex flex-col items-center justify-start">
        {/* First Page */}
        <div className="w-full h-screen flex flex-col items-center justify-center">
          {user?.currentUser ? (
            <div className="flex flex-col items-center">
              <h1 className="text-5xl font-bold text-white mb-4">
                {`Status: ${status}`}
              </h1>
              <h1 className="text-4xl mb-4 font-bold text-white">
                Welcome, {user.currentUser.email}!
              </h1>
              <div className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                <div className="flex flex-col text-white">
                  <h1 className="font-bold text-[4vh]">Pricing</h1>
                  <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col gap-[1vh]">
                      <h1 className="text-[3vh]">Basic</h1>
                      <button className="bg-[#d64040] p-[2vh] rounded-full">
                        Choose Basic
                      </button>
                    </div>
                    <div className="flex flex-col gap-[1vh]">
                      <h1 className="text-[3vh]">Professional</h1>
                      <button
                        className="bg-[#d64040] p-[2vh] rounded-full"
                        onClick={handleUpgradeToPremium}
                      >
                        Choose Professional
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleManageSubscription}
                className="py-2 px-6 text-white bg-blue-600 rounded-lg transition-transform transform hover:scale-105 mt-4"
              >
                Manage Subscription
              </button>
              <button
                onClick={handleSignOut}
                className="py-2 px-6 text-white bg-red-600 rounded-lg transition-transform transform hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
  
        {/* Second Page */}
        <div className="w-full h-screen flex flex-col items-center justify-center">
          {user?.currentUser ? (
            <DecksPage />
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
    </>
  );
}

export default LandingPage;
