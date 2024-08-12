"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DecksPage = () => {
  const [decks, setDecks] = useState([]);
  const [deckName, setDeckName] = useState('');
  const [deckContent, setDeckContent] = useState('');
  const [editDeckName, setEditDeckName] = useState('');
  const [editDeckContent, setEditDeckContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const currentUser = useSelector(selectUser);

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
    setEditDeckName(deck.id);
    setEditDeckContent(deck.content.map(item => `Question: ${item.question}\nAnswer: ${item.answer}`).join('\n\n')); 
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const userCollectionRef = collection(firestore, 'Users', currentUser?.currentUser.id, 'flashcards');
      const docRef = doc(userCollectionRef, editDeckName);
      const formattedContent = editDeckContent.split('\n\n').map(item => {
        const [question, answer] = item.split('\n');
        return {
          question: question.replace('Question: ', ''),
          answer: answer.replace('Answer: ', '')
        };
      });
      await setDoc(docRef, { content: formattedContent });
      alert("Deck updated successfully!");
      setIsEditing(false);
      setEditDeckName('');
      setEditDeckContent('');
      fetchDecks(); 
    } catch (error) {
      console.error("Error updating deck:", error);
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

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to right, #ff9a9e, #fad0c4)', minHeight: '100vh', minWidth: '100vw', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: '#ffffff', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
        Flashcard Decks
      </Typography>

      {/* Adding a New Deck */}
      <Box mb={4} p={3} borderRadius={2} boxShadow={3} bgcolor="background.paper" sx={{ maxWidth: '600px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
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
          label="Deck Content (JSON)"
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
          onClick={() => addFlashcardDeck(deckName, deckContent)}
          sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}
        >
          Add Deck
        </Button>
      </Box>

      {/* Listing Decks */}
      <List sx={{ width: '100%', maxWidth: '600px' }}>
        {decks.map((deck) => (
          <ListItem key={deck.id} sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2, background: '#ffffff', boxShadow: 2 }}>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="subtitle1" component="div" fontWeight="bold" sx={{ color: '#333' }}>Deck: {deck.id}</Typography>
                  {deck.content.map((item, index) => (
                    <Box key={index} mt={1} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, background: '#f0f0f0', boxShadow: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#555' }}>Question:</Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>{item.question}</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#555' }}>Answer:</Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{item.answer}</Typography>
                    </Box>
                  ))}
                </Box>
              }
            />
            <IconButton onClick={() => handleEdit(deck)} sx={{ color: '#1976d2' }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(deck.id)} sx={{ color: '#d32f2f' }}>
              <DeleteIcon />
            </IconButton>
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
    </Container>
  );
};

export default DecksPage;
