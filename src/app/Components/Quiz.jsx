import React, { useState } from 'react';
import { Button, Box, Typography, Icon, Grid } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Quiz = ({ questions }) => {
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
                          <Icon color="error" sx={{ marginLeft: 1 }}>
                            <CancelIcon />
                          </Icon>
                        )}
                        {option === question.answer && (
                          <Icon color="success" sx={{ marginLeft: 1 }}>
                            <CheckCircleIcon />
                          </Icon>
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
  );
};

export default Quiz;
