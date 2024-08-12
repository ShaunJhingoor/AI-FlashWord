"use client";

import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';

const GenerateComponent = () => {
  const [inputValue, setInputValue] = useState('');

  const handleGenerate = () => {

    console.log("Generated Value:", inputValue);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Input Generator
      </Typography>
      <TextField
        label="Enter your text"
        variant="outlined"
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleGenerate}
        sx={{ mt: 2 }}
      >
        Generate
      </Button>
    </Container>
  );
}

export default GenerateComponent;
