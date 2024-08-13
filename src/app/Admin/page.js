"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

const DecksPage = () => {
  const [decks, setDecks] = useState([]);
  const [deckName, setDeckName] = useState('');
  const [deckContent, setDeckContent] = useState('');
  const [editDeckName, setEditDeckName] = useState('');
  const [editDeckContent, setEditDeckContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentUser = useSelector(selectUser);
  const [flashcards,setFlashcards] = useState([])

  const fetchDecks = async () => {
    try {
      const userCollectionRef = collection(firestore, 'Users', currentUser?.currentUser.id, 'flashcards');
      const snapshot = await getDocs(userCollectionRef);
      const decksList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
      const userCollectionRef = collection(firestore, 'Users', currentUser?.currentUser.id, 'flashcards');
      const docRef = doc(userCollectionRef, name);

      await setDoc(docRef, { content: JSON.parse(content) });
      alert("Deck added successfully!");
      setDeckName('');
      setDeckContent('');
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
    console.log(currentDeck)
  };

  const handleSave = async () => {
    console.log(currentDeck)
    try {
      const userCollectionRef = collection(firestore, 'Users', currentUser?.currentUser.id, 'flashcards');
      
      // Split the content into an array of question-answer pairs
      const formattedContent = editDeckContent.split('\n\n').map(item => {
        const lines = item.split('\n').map(line => line.trim()); // Trim each line
        if (lines.length < 2) {
          // Skip items with less than 2 lines (invalid entries)
          return null;
        }
        // Extract question and answer
        const question = lines[0].replace('Question: ', '').trim();
        const answer = lines[1].replace('Answer: ', '').trim();
        // Ensure both question and answer are non-empty
        if (!question || !answer) {
          return null; // Skip entries with empty question or answer
        }
        return { question, answer };
      }).filter(item => item !== null); // Remove null entries
  
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
      setEditDeckName('');
      setEditDeckContent('');
      fetchDecks(); 
    } catch (error) {
      console.error("Error updating deck:", error);
      alert("Failed to update deck. Please check the content format.");
    }
  };
  


  const handleDelete = async (deckName) => {
    try {
      const userCollectionRef = collection(firestore, 'Users', currentUser?.currentUser.id, 'flashcards');
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
    e.preventDefault()
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
  

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to right, #ff9a9e, #fad0c4)', minHeight: '100vh', minWidth: '100vw', padding: '20px' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: '#333', fontWeight: 'bold' }}>
        Flashcard Decks
      </Typography>

      {/* Adding a New Deck */}
      <Box mb={4} p={3} borderRadius={2} boxShadow={3} bgcolor="background.paper" sx={{ maxWidth: '600px', background: 'linear-gradient(to right, #ffffff, #f9f9f9)' }}>
        <Typography variant="h6" gutterBottom>
          Add New Flashcard Deck
        </Typography>
        <TextField
          label="Deck Name"
          variant="outlined"
          fullWidth
          value={deckName}
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

      {/* Listing Decks */}
      <List sx={{ width: '100%', maxWidth: '15rem' }}>
        {decks.map((deck) => (
          <ListItem key={deck.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, background: '#f9f9f9', boxShadow: 1 }}>
            <ListItemText
              primary={
                <Box textAlign="center">
                  <Typography
                    variant="subtitle1"
                    component="div"
                    fontWeight="bold"
                    onClick={() => handleDeckClick(deck)}
                    sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2' }}
                  >
                    {deck.id}
                  </Typography>
                  <Box display="flex" justifyContent="center" mt={1}>
                    <IconButton onClick={() => handleEdit(deck)} sx={{ color: '#1976d2'}}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(deck.id)} sx={{ color: '#d32f2f' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Edit Deck Modal */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setIsEditing(false)} color="primary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Flashcard Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth sx={{
      backgroundColor: 'transparent',
     '.MuiPaper-root': {
      backgroundColor: '#FAC9BF',
        },
      }}>
      <DialogTitle 
        sx={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          position: 'relative',
          color: 'white',
          fontSize: '3rem'
        }}
      >
        {currentDeck && currentDeck.id}
        <IconButton
          onClick={() => setIsModalOpen(false)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#d32f2f'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', backgroundColor: 'inherit', p: 0 }}>
        <Box
          sx={{
            perspective: '1000px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: '30vh',
            width: '70%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isFlipped ? 'rotateY(180deg)' : 'none',
            marginBottom: "2rem",
          }}
          onClick={handleCardFlip}
        >
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2rem',
              padding: '10px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            {currentDeck && currentDeck.content[currentCardIndex].question}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2rem',
              padding: '10px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transform: 'rotateY(180deg)'
            }}
          >
            {currentDeck && currentDeck.content[currentCardIndex].answer}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', padding: 0 }}>
        <IconButton
          onClick={handlePrevCard}
          disabled={currentCardIndex === 0}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: 1,
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <IconButton
          onClick={handleNextCard}
          disabled={!currentDeck || currentCardIndex === currentDeck.content.length - 1}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: 1,
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
