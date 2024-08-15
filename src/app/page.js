"use client";

// import { useEffect, useState } from "react";
// import LoginPage from "./Components/login";
// import SignUpPage from "./Components/signUp";
// import { signOut } from "firebase/auth";
// import { auth } from "../firebase/config";
// Ensure this import is correct
// import getStripe from "../../utils/get-stripe";
// import { getCheckoutUrl, getPortalUrl } from "./account/stripePayment";
// import { useRouter } from "next/navigation";
// import { getPremiumStatus } from "./account/PremiumStatus";

import { selectUser } from "../store/userSlice";
import { useSelector
  // , useDispatch 
} 
  from "react-redux";
import Landing from "./Components/Landing";
import Nav from "./Components/Nav";
import DecksPage from "./dashboard/page";

//Almost Everything in this page is going to go into a navbar component
function LandingPage() {
  const user = useSelector(selectUser);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalType, setModalType] = useState("");
  // const [status, setStatus] = useState("");
  // const dispatch = useDispatch();
  // const router = useRouter();

  // const openModal = (type) => {
  //   setModalType(type);
  //   setIsModalOpen(true);
  // };

  // const closeModal = () => setIsModalOpen(false);

  // const handleSignOut = () => {
  //   if (confirm("Are you sure you want to sign out?")) {
  //     signOut(auth)
  //       .then(() => {
  //         dispatch(setUser(null));
  //       })
  //       .catch((error) => {
  //         console.log(error.message);
  //       });
  //   }
  // };

  // const handleUpgradeToPremium = async () => {
  //   const priceId = "price_1Pnnf7DM3EY2E0WOjkZvgNbV";
  //   // "id": "price_1Pnnf7DM3EY2E0WOjkZvgNbV",
  //   const checkoutUrl = await getCheckoutUrl(priceId, user?.currentUser.id);
  //   router.push(checkoutUrl);
  // };

  // const handleManageSubscription = async () => {
  //   const portalUrl = await getPortalUrl(user);
  //   router.push(portalUrl);
  // };

  // https://dashboard.stripe.com/test/settings/billing/portal need to go here to set up portal link have to redo this
  //PLEASE DO NOT GET RID OF THIS !!
  // useEffect(() => {
  //   const checkPremiumStatus = async () => {
  //     const premiumStatus = await getPremiumStatus(user);
  //     console.log(premiumStatus);
  //     setStatus(premiumStatus ? "Premium" : "Basic");
  //   };
  //   if (user?.currentUser) {
  //     checkPremiumStatus();
  //   }
  // }, [user]);

  return (
    <>
      {user?.currentUser ? (
        <>
          <Nav user={user}></Nav>
          <DecksPage />
        </>
      ) : (
        <>
          <Landing />
        </>
      )}
    </>
  );
}

export default LandingPage;
