"use client";
import { selectUser } from "../store/userSlice";
import { useSelector } 
  from "react-redux";
import Landing from "./Components/Landing";
import Nav from "./Components/Nav";
import DecksPage from "./dashboard/page";

function LandingPage() {
  const user = useSelector(selectUser);

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
