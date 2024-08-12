"use client";

import React, { useEffect, useState } from "react";
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
  Card
} from "@mui/material";
import { selectUser } from "../../store/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { doc, collection, setDoc, getDoc, writeBatch } from "firebase/firestore";
import { firestore } from "../../firebase/config";

const GenerateComponent = () => {
  const user = useSelector(selectUser);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async () => {
    fetch("api/generate", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json())
      .then((data) => setFlashcards(data));
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(firestore);
    const userDocRef = doc(collection(firestore, "Users"), user.currentUser.id);
    const docSnap = await getDoc(userDocRef);
    console.log(user.uid)

    if (docSnap.exists()) {
      const collections = docSnap.data().collections || []; // Ensure collections is an array if undefined
      const collectionExists = collections.find((f) => f.name === name);

      if (collectionExists) {
        alert("Name already exists");
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { flashcards: collections }, { merge: true }); // Corrected typographical error
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }
    const colRef = collection(userDocRef, name);
    flashcards.forEach((flashcard) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocRef, flashcard);
    });

    await batch.commit();
    handleClose();
    router.push("/flashcards");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 4,
          mb: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Generate Flashcards</Typography>
        <Paper sx={{ p: 4, width: "100%" }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter Text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
          ></TextField>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            fullWidth
          >
            Submit
          </Button>
        </Paper>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Flashcards Preview</Typography>
          <Grid container spacing={3}>
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
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="secondary" onClick={handleOpen}>
              Save Flashcards
              </Button>
            </Box>
        </Box>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save Flashcards</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcards collection
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveFlashcards}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GenerateComponent;
