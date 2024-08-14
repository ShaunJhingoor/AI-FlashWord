"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
import getStripe from "../../../utils/get-stripe";
import { useSearchParams } from "next/navigation";
import { Box, Container, Typography } from "@mui/material";

const ResultPage = () => {
//   const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) return;

      try {
        const res = await fetch(
          `api/checkout_session?session_id=${session_id}`
        );
        const sessionData = await res.json();
        if (res.ok) {
          setSession(sessionData);
        } else {
          setError(sessionData.error);
        }
      } catch (err) {
        setError("An error occured");
      } finally {
        setLoading(false)
      }
    };

    fetchCheckoutSession();
  }, [session_id]);
  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Typography variant="h6">{error}</Typography>;
  }
  console.log('Session obj: ', session)

  return (
    <Container
      maxWidth="100vw"
      sx={{
        textAlign: "center",
        mt: 4,
      }}
    >
      {session.payment_status === "paid" ? (
        <>
          <Typography variant="h4">Thank you for purchasing</Typography>
          <Typography variant="h6">Session ID: {session_id}</Typography>
        </>
      ) : (
        <>
          <Typography variant="h4">Payment Failed</Typography>
          <Typography variant="body1">Payment was not successful. Please try again.</Typography>
        </>
      )}
    </Container>
  );
};

export default ResultPage
