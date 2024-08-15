"use client";

import { useEffect, useState } from "react";
import { getPremiumStatus } from "../account/PremiumStatus";
import { getPortalUrl } from "../account/stripePayment";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

function Nav({ user }) {
  const [status, setStatus] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  // https://dashboard.stripe.com/test/settings/billing/portal need to go here to set up portal link have to redo this
  //PLEASE DO NOT GET RID OF THIS !!
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premiumStatus = await getPremiumStatus(user);
      console.log(premiumStatus);
      setStatus(premiumStatus ? "Premium" : "Basic");
    };
    if (user?.currentUser) {
      checkPremiumStatus();
    }
  }, [user]);

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

  const handleManageSubscription = async () => {
    const portalUrl = await getPortalUrl(user);
    router.push(portalUrl);
  };

  return (
    <div className="w-[full] flex justify-between items-center bg-gradient-to-b from-[#111111] to-[#323232] py-[1vh] px-[2vh] rounded-b-[3vh]">
      <div className="w-[30%]">
        <button className="lowercase px-[2vh] py-[1vh] bg-white hover:bg-[#383838] transition-all ease-in-out text-[#383838] hover:text-[#FFFFFF] text-[2vh] font-semibold rounded-full">
          {status}
        </button>
      </div>

      <div className="flex justify-center items-center">
        <h1 className="text-[3vh] text-white font-semibold">
          Welcome {user?.currentUser.email}
        </h1>
      </div>

      <div className="flex justify-end gap-[2vh] w-[30%]">
        <button
          className="lowercase px-[2vh] py-[1vh] bg-[#383838] hover:bg-[#929292] transition-all ease-in-out text-[#FFFFFF] text-[2vh] font-semibold rounded-full"
          onClick={handleManageSubscription}
        >
          settings
        </button>
        <button
          className="lowercase px-[2vh] py-[1vh] bg-[#383838] hover:bg-[#929292] transition-all ease-in-out text-[#FFFFFF] text-[2vh] font-semibold rounded-full"
          onClick={handleSignOut}
        >
          sign out
        </button>
      </div>
    </div>
  );
}

export default Nav;
