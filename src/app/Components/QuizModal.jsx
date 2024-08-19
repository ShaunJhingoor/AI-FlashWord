import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Quiz from './Quiz';

const QuizModal = ({ open, onClose, quizDeck, currentQuestionIndex, handleAnswer }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        backgroundColor: "transparent",
        ".MuiPaper-root": {
          backgroundColor: "#111111",
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
        {quizDeck && quizDeck.id}
        <IconButton
          onClick={onClose}
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

      <DialogContent sx={{ textAlign: "center", backgroundColor: "inherit", p: 0 }}>
        {quizDeck && (
          <Quiz
            questions={quizDeck.Questions}
            currentQuestionIndex={currentQuestionIndex}
            handleAnswer={handleAnswer}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
