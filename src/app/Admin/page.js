"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box, Grid,
} from "@mui/material";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase/config";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import { getDocument } from "pdfjs-dist";

const DecksPage = () => {
  const [decks, setDecks] = useState([]);
  const [deckName, setDeckName] = useState("");
  const [deckContent, setDeckContent] = useState("");
  const [editDeckName, setEditDeckName] = useState("");
  const [editDeckContent, setEditDeckContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null)
  const currentUser = useSelector(selectUser);
  const CMAP_URL = "../../../node_modules/pdfjs-dist/cmaps/";
  const CMAP_PACKED = true;

  const fetchDecks = async () => {
    try {
      const userCollectionRef = collection(
        firestore,
        "Users",
        currentUser?.currentUser.id,
        "flashcards"
      );
      const snapshot = await getDocs(userCollectionRef);
      const decksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDecks(decksList);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [currentUser]);

  const addFlashcardDeck = async (name, content) => {
    try {
      if (!name || !content) {
        alert("Deck name or content is missing.");
        return;
      }
      const userCollectionRef = collection(
        firestore,
        "Users",
        currentUser?.currentUser.id,
        "flashcards"
      );
      const docRef = doc(userCollectionRef, name);

      await setDoc(docRef, { content: JSON.parse(content) });
      alert("Deck added successfully!");
      setDeckName("");
      setDeckContent("");
      fetchDecks();
    } catch (error) {
      console.error("Error adding deck:", error);
    }
  };

  const handleEdit = (deck) => {
    setCurrentDeck(deck);
    setEditDeckName(deck.id);
    setEditDeckContent(deck.content.map(item => `Question: ${item.question}\nAnswer: ${item.answer}`).join('\n\n'));
    setIsEditing(true);
    console.log(currentDeck);
  };

  const handleSave = async () => {
    console.log(currentDeck);
    try {
      const userCollectionRef = collection(
        firestore,
        "Users",
        currentUser?.currentUser.id,
        "flashcards"
      );

      // Split the content into an array of question-answer pairs
      const formattedContent = editDeckContent
        .split("\n\n")
        .map((item) => {
          const lines = item.split("\n").map((line) => line.trim()); // Trim each line
          if (lines.length < 2) {
            // Skip items with less than 2 lines (invalid entries)
            return null;
          }
          // Extract question and answer
          const question = lines[0].replace("Question: ", "").trim();
          const answer = lines[1].replace("Answer: ", "").trim();
          // Ensure both question and answer are non-empty
          if (!question || !answer) {
            return null; // Skip entries with empty question or answer
          }
          return { question, answer };
        })
        .filter((item) => item !== null); // Remove null entries

      // If the deck name has changed
      if (editDeckName !== currentDeck?.id) {
        // 1. Delete the old deck
        const oldDocRef = doc(userCollectionRef, currentDeck?.id);
        await deleteDoc(oldDocRef);

        // 2. Create the new deck with the new name
        const newDocRef = doc(userCollectionRef, editDeckName);
        await setDoc(newDocRef, { content: formattedContent });
      } else {
        // Update the existing deck with the same name
        const docRef = doc(userCollectionRef, editDeckName);
        await setDoc(docRef, { content: formattedContent });
      }

      alert("Deck updated successfully!");
      setIsEditing(false);
      setEditDeckName("");
      setEditDeckContent("");
      fetchDecks();
    } catch (error) {
      console.error("Error updating deck:", error);
      alert("Failed to update deck. Please check the content format.");
    }
  };

  const handleDelete = async (deckName) => {
    try {
      const userCollectionRef = collection(
        firestore,
        "Users",
        currentUser?.currentUser.id,
        "flashcards"
      );
      const docRef = doc(userCollectionRef, deckName);
      await deleteDoc(docRef);
      alert("Deck deleted successfully!");
      fetchDecks();
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const handleDeckClick = (deck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setIsModalOpen(true);
    setIsFlipped(false);
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < currentDeck.content.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("api/generate", {
        method: "POST",
        body: deckContent,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards.");
      }

      const data = await response.json();

      // Check if flashcards data is in expected format
      if (Array.isArray(data) && data.every(card => card.question && card.answer)) {
        setFlashcards(data);
        await addFlashcardDeck(deckName, JSON.stringify(data));
      } else {
        alert("Invalid flashcards format received.");
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      alert("Failed to generate or add flashcards.");
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name.split(".pdf")[0])
    }
    // console.log(selectedFile)
  };

  const extractTextFromPDF = async (pdf) => {
    console.log(pdf)
    const numPages = pdf.numPages;
    let text = "";

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      text += `${pageText}\n`;
    }

    return text;
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        // const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file))
        // // .promise;
        console.log('PDF submit: ', pdf)
        const text = await extractTextFromPDF(pdf);
        setExtractedText(text)

      } catch (error) {
        console.error("Error extracting text from PDF:", error);
      }
    } else {
      alert("No File Selected");
    }
  };

  useEffect(() => {
    if (extractedText && fileName) {
      handleFileSubmitAI()
        .then(() => {
          // Clear extractedText and fileName after processing
          setExtractedText("");
          setFileName("");
          setFile(null);
        })
        .catch((error) => {
          console.error("Error during file processing:", error);
        });
    }
  }, [extractedText, fileName]);

  const handleFileSubmitAI = async () => {
    if (!extractedText || !fileName) {
      alert("Extracted text or file name is missing.");
      return;
    }
    try {
      const response = await fetch("api/generate", {
        method: "POST",
        body: extractedText,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards.");
      }

      const data = await response.json();

      if (
        Array.isArray(data) &&
        data.every((card) => card.question && card.answer)
      ) {
        await addFlashcardDeck(fileName, JSON.stringify(data));
      } else {
        alert("Invalid flashcards format received.");
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      alert("Failed to generate or add flashcards.");
    } finally {
      // Clear the file input field after processing
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setExtractedText('');
    setFileName('');
    setFile(null);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(to right, #f472b6, #a855f7, #3b82f6)",
        minHeight: "100vh",
        minWidth: "100vw",
        padding: "20px",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mb: 4, color: "#333", fontWeight: "bold", color: "white" }}
      >
        Flashcard Decks
      </Typography>

      {/* Adding a New Deck */}
      <Box
        mb={4}
        p={3}
        borderRadius={2}
        boxShadow={3}
        bgcolor="background.paper"
        sx={{
          maxWidth: "600px",
          background: "linear-gradient(to right, #ffffff, #f9f9f9)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Add New Flashcard Deck
        </Typography>
        <TextField
          label="Deck Name"
          variant="outlined"
          fullWidth
          onChange={(e) => setDeckName(e.target.value)}
          margin="normal"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Build your deck"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={deckContent}
          onChange={(e) => setDeckContent(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={(e) => handleSubmit(e)}
          sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}
        >
          Add Deck
        </Button>
      </Box>

      <Box
        mb={4}
        p={3}
        borderRadius={2}
        boxShadow={3}
        bgcolor="background.paper"
        sx={{
          maxWidth: "600px",
          background: "linear-gradient(to right, #ffffff, #f9f9f9)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Upload PDF to Generate Deck
        </Typography>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileChange(e)}
          ref={fileInputRef}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => handleFileSubmit(e)}
          sx={{ mt: 2 }}
        >
          Generate Deck from PDF
        </Button>
      </Box>

      {/* Listing Decks */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '100%' }}>
      <Grid container spacing={1} justifyContent="center">
        {decks.map((deck) => (
          <Grid item xs={12} sm={6} md={4} key={deck.id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
               sx={{
                border: '1px solid #ccc', // Lighter border for a cleaner look
                borderRadius: 0.5, // Slightly rounded corners
                background: '#fafafa', // Slightly off-white background for a paper effect
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow to mimic paper lift
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30rem',
                height: '15rem',
                transition: 'box-shadow 0.3s, transform 0.3s', // Smooth transition for hover effects
                marginTop: "2rem",
                marginBottom: "2rem",
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Slightly stronger shadow on hover
                  transform: 'scale(1.01)', // Slightly enlarge the box on hover
                },
              }}
            >
              <Typography
                 variant="subtitle1"
                 component="div"
                 fontWeight="bold"
                 onClick={() => handleDeckClick(deck)}
                 fontSize="2rem"
                 sx={{
                   cursor: 'pointer',
                   textDecoration: 'underline',
                   color: '#1976d2',
                   mb: 1,
                   transition: 'color 0.3s', // Smooth transition for hover effect
                   '&:hover': {
                     color: '#1565c0', // Darker color on hover
                   },
                 }}
              >
                {deck.id}
              </Typography>
              <Box display="flex" justifyContent="center" mb={1}>
                <IconButton onClick={() => handleEdit(deck)} sx={{ color: '#1976d2', mr: 1, fontSize: "2rem"}}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(deck.id)} sx={{ color: '#d32f2f' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>


      {/* Edit Deck Modal */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Deck</DialogTitle>
        <DialogContent>
          <TextField
            label="Deck Name"
            variant="outlined"
            fullWidth
            value={editDeckName}
            onChange={(e) => setEditDeckName(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Deck Content"
            variant="outlined"
            fullWidth
            multiline
            rows={8}
            value={editDeckContent}
            onChange={(e) => setEditDeckContent(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flashcard Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          backgroundColor: "transparent",
          ".MuiPaper-root": {
            backgroundColor: "#FAC9BF",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            position: "relative",
            color: "white",
            fontSize: "3rem",
          }}
        >
          {currentDeck && currentDeck.id}
          <IconButton
            onClick={() => setIsModalOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#d32f2f",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ textAlign: "center", backgroundColor: "inherit", p: 0 }}
        >
          <Box
            sx={{
              perspective: "1000px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              height: "30vh",
              width: "70%",
              transformStyle: "preserve-3d",
              transition: "transform 0.6s",
              transform: isFlipped ? "rotateY(180deg)" : "none",
              marginBottom: "2rem",
            }}
            onClick={handleCardFlip}
          >
            <Box
              sx={{
                position: "absolute",
                height: "100%",
                width: "100%",
                backfaceVisibility: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "2rem",
                padding: "10px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transform: isFlipped ? "rotateY(180deg)" : "none",
              }}
            >
              {currentDeck && currentDeck.content[currentCardIndex].question}
            </Box>
            <Box
              sx={{
                position: "absolute",
                height: "100%",
                width: "100%",
                backfaceVisibility: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "2rem",
                padding: "10px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transform: "rotateY(180deg)",
              }}
            >
              {currentDeck && currentDeck.content[currentCardIndex].answer}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", padding: 0 }}>
          <IconButton
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "#fff",
              borderRadius: "50%",
              boxShadow: 1,
              "&:hover": {
                boxShadow: 3,
                backgroundColor: "#fff", // Adjust the shadow intensity as needed
              },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={handleNextCard}
            disabled={
              !currentDeck ||
              currentCardIndex === currentDeck.content.length - 1
            }
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "#fff",
              borderRadius: "50%",
              boxShadow: 1,
              "&:hover": {
                boxShadow: 3,
                backgroundColor: "#fff",
              },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DecksPage;
