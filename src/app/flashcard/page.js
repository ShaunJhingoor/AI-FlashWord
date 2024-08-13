"use client";

import { selectUser } from "../../store/userSlice";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { collection, doc, docs, getDocs, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase/config";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Grid,
  CardActionArea,
  Card,
} from "@mui/material";

export default function Flashcard() {
  const user = useSelector(selectUser);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("id");

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;
      const colRef = collection(
        doc(collection(firestore, "Users"), user.currentUser.id),
        search
      );
      const docs = await getDocs(colRef);
      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
    }

    getFlashcard();
  }, [user, search]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!user.currentUser.id || !user.currentUser.email) {
    return <div>Test</div>;
  }

  return (
    <Container maxWidth="100vw">
      <Grid container spacing={3} sx={{ mt: 4 }}>
              {flashcards.map((flashcard, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card>
                    <CardActionArea onClick={() => handleCardClick(i)}>
                      <CardContent>
                        <Box
                          sx={{
                            perspective: "1000px",
                            "& > div": {
                              transition: "transform 0.6s", // Corrected: Added comma
                              transformStyle: "preserve-3d", // Corrected: Added comma
                              position: "relative", // Corrected: Added comma
                              width: "100%", // Moved up for clarity
                              height: "200px", // Moved up for clarity
                              boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                              transform: flipped[i]
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)", // Using ternary for dynamic transform
                            },
                            "& > div > div": {
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "2px",
                              boxSizing: "border-box",
                            },
                            "& > div > div:nth-of-type(2)": {
                              transform: "rotateY(180deg)",
                            },
                          }}
                        >
                          <div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.front}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.back}
                              </Typography>
                            </div>
                          </div>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
      </Grid>
    </Container>
  );
}
