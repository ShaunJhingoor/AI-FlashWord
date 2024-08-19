import React, { useState } from 'react';
import { Box, Typography, Button, Grid, IconButton, Dialog, DialogContent } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Quiz = ({ questions, onClose }) => {
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(''));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionIndex, answer) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = answer;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return answer === questions[index].answer ? score + 1 : score;
    }, 0);
  };

  const handleRetry = () => {
    setUserAnswers(Array(questions.length).fill(''));
    setShowResults(false);
  };

  return (
    <Dialog open={true} onClose={onClose} PaperProps={{ style: { backgroundColor: 'black', color: 'white' } }}>
      <DialogContent>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', top: 10, right: 10, color: 'red' }}
        >
          <CancelIcon />
        </IconButton>
        <Box sx={{ padding: 3 }}>
          {!showResults ? (
            <Box>
              {questions.map((question, index) => (
                <Box key={index} sx={{ marginBottom: 3 }}>
                  <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    Question {index + 1}:
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: 2, textAlign: 'center', fontSize: '2rem' }}>
                    {question.question}
                  </Typography>
                  <Grid container spacing={2}>
                    {[question.a, question.b, question.c, question.d].map((option, optionIndex) => (
                      <Grid item xs={6} key={option}>
                        <Button
                          variant={userAnswers[index] === option ? 'contained' : 'outlined'}
                          color="primary"
                          onClick={() => handleAnswerChange(index, option)}
                          sx={{ width: '100%' }}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
              >
                Submit
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" sx={{ marginBottom: 2 }}>Quiz Results</Typography>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>Your Score: {calculateScore()} / {questions.length}</Typography>
              <Box>
                {questions.map((question, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                      <strong>Question:</strong> {question.question}
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                      <strong>Your Answer:</strong> {userAnswers[index]}
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                      <strong>Correct Answer:</strong> {question.answer}
                    </Typography>
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      {[question.a, question.b, question.c, question.d].map((option, optionIndex) => (
                        <Grid item xs={6} key={option}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ marginRight: 1 }}>
                              {String.fromCharCode(65 + optionIndex)}.
                            </Typography>
                            <Typography variant="body1">{option}</Typography>
                            {userAnswers[index] === option && userAnswers[index] !== question.answer && (
                              <CheckCircleIcon color="error" sx={{ marginLeft: 1 }} />
                            )}
                            {option === question.answer && (
                              <CheckCircleIcon color="success" sx={{ marginLeft: 1 }} />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Box>
              <Button onClick={handleRetry} variant="contained" color="secondary">
                Retry
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Quiz;
