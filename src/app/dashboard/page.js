"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
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
  const fileInputRef = useRef(null);
  const currentUser = useSelector(selectUser);

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
    setEditDeckContent(
      deck.content
        .map((item) => `Question: ${item.question}\nAnswer: ${item.answer}`)
        .join("\n\n")
    );
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
      if (
        Array.isArray(data) &&
        data.every((card) => card.question && card.answer)
      ) {
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
      setFileName(selectedFile.name.split(".pdf")[0]);
    }
    // console.log(selectedFile)
  };

  const extractTextFromPDF = async (pdf) => {
    console.log(pdf);
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
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file))
          .promise;
        // const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file))
        // // .promise;
        console.log("PDF submit: ", pdf);
        const text = await extractTextFromPDF(pdf);
        setExtractedText(text);
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
        fileInputRef.current.value = "";
      }
    }
    setExtractedText("");
    setFileName("");
    setFile(null);
  };

  return (
    <>
      <div className="w-full m-auto flex flex-col justify-center items-center gap-[4vh] pt-[4vh]">
        <h1 className="capitalize text-[#989898] font-light text-[4vh]">
          generate flashcards
        </h1>

        {/* Generation container */}
        <div className="w-full flex items-center justify-around">
          {/* Deck Generation */}
          <div className="flex flex-col justify-center items-center gap-[2vh]">
            <div className="h-[50vh] relative bg-gradient-to-b from-[#111111] to-[#323232] shadowStroke dropShadow w-[60vh] flex flex-col justify-start items-center gap-[4vh] px-[4vh] py-[4vh] rounded-[2vh]">
              <div className="flex flex-col justify-start w-full gap-[1vh]">
                <input
                  type="text"
                  label="Deck Name"
                  aria-label="Deck Name"
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Enter Deck Title"
                  className="w-full h-[5vh] text-[5vh] text-white font-bold bg-transparent border-none outline-none placeholder-[#989898]"
                  required
                />
                <h3 className="text-[2vh] text-[#989898] font-medium capitalize">
                  use ai to generate a deck
                </h3>
              </div>

              <div className="w-full h-full">
                <textarea
                  id="deckContent"
                  value={deckContent}
                  placeholder="build your deck"
                  onChange={(e) => setDeckContent(e.target.value)}
                  required
                  className="w-full h-full rounded-[2vh] pl-[1.5vh] border-[#FFFFFF] border-[0.15vh] p-[2vh] text-[2vh] bg-[#1B1B1B] text-[#EBEBEB] font-semibold resize-none"
                ></textarea>
              </div>
            </div>
            <div className="flex inset-0 justify-center items-center w-[60vh]">
              <div className="flex-1 w-full">
                <h2 className="text-[3vh] text-[#989898]">how many cards?</h2>
              </div>
              <input
                type="text"
                className="lowercase transition-all ease-in-out text-black placeholder:text-[#383838] underline text-[2vh] font-semibold text-center placeholder:text-[2vh] w-[10%] p-[2vh]"
                placeholder="1"
                maxLength="10"
              />
              <button
                onClick={(e) => handleSubmit(e)}
                className="lowercase bg-[#383838] hover:bg-[#929292] transition-all ease-in-out text-[#FFFFFF] text-[2vh] font-semibold rounded-full px-[4vh] p-[2vh] box-border"
              >
                generate
              </button>
            </div>
          </div>

          {/* PDF Generation */}
          <div className="flex flex-col justify-center items-center gap-[2vh]">
            <div className="h-[50vh] relative bg-gradient-to-b from-[#D9D9D9] to-[#E3E3E3] shadowStroke dropShadow w-[60vh] flex flex-col justify-start items-center gap-[4vh] px-[4vh] py-[4vh] rounded-[2vh]">
              <div className="flex flex-col justify-start w-full gap-[1vh]">
                <input
                  type="text"
                  label="Deck Name"
                  aria-label="Deck Name"
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Enter Deck Title"
                  className="w-full h-[5vh] text-[5vh] text-white font-bold bg-transparent border-none outline-none placeholder-[#989898]"
                  required
                />
                <h3 className="text-[2vh] text-[#989898] font-medium capitalize">
                  upload PDF to generate deck
                </h3>
                <input
                  type="file"
                  accept=".pdf"
                  id="fileInput"
                  onChange={(e) => handleFileChange(e)}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="fileInput"
                  className="flex flex-col underline text-[4vh] text-[#989898] font-semibold justify-center items-center w-full h-[30vh] bg-[#D9D9D9] border-[#141414] border-dashed border-[0.25vh] rounded-[2vh] text-center cursor-pointer"
                >
                  <img src="/cloud.png"></img>
                  Browse file to upload
                </label>
              </div>
            </div>
            <div className="flex lowercase justify-around items-center gap-[2vh] w-[60vh]">
              <div className="flex-1 w-full">
                <h2 className="text-[3vh] text-[#989898]">how many cards?</h2>
              </div>
              <input
                type="text"
                className="lowercase transition-all ease-in-out text-black placeholder:text-[#383838] underline text-[2vh] font-semibold text-center placeholder:text-[2vh] w-[10%] p-[2vh]"
                placeholder="1"
                maxLength="10"
              />
              <button
                onClick={(e) => handleFileSubmit(e)}
                className="lowercase bg-[#383838] hover:bg-[#929292] transition-all ease-in-out text-[#FFFFFF] text-[2vh] font-semibold rounded-full px-[4vh] p-[2vh] box-border"
              >
                generate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 w-[80%] m-auto gap-[5vh] pt-[4vh]">
        {decks.map((deck) => (
          <div
          onClick={() => handleDeckClick(deck)}
            key={deck.id}
            className="cursor-pointer flex flex-col gap-[2vh] shadowStroke justify-center items-center bg-gradient-to-b from-[#111111] to-[#323232] h-[40vh] rounded-[4vh]"
          >
            <h1
              className="text-[5vh] text-white font-semibold cursor-pointer"
            >
              {deck.id}
            </h1>
            <div className="flex gap-[2vh] px-[5vh]">
            <button onClick={(e) => {
                e.stopPropagation(); 
                handleEdit(deck);
            }}>
                <img src="/edit.png"></img>
              </button>
              <button onClick={(e) => {
                e.stopPropagation(); 
                handleDelete(deck.id);
            }}>
                <img src="/delete.png"></img>
              </button>
            </div>
          </div>
        ))}
      </div>

    
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
    </>
  );
};

export default DecksPage;
