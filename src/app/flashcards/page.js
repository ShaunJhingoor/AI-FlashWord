"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase/config";
import { selectUser } from "../../store/userSlice";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  Grid,
  Container,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import Route from "../Components/route";

export default function Flashcards() {
  const user = useSelector(selectUser);
  const pathname = usePathname();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState([]);


  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(firestore, "Users"), user.currentUser.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  if (!user.currentUser.id || !user.currentUser.email) {
    return <div>Test</div>;
  }

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  return (
    <>
      <Route current={pathname} />
      <Container maxWidth="100vw">
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {flashcard.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
