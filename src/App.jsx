import React from 'react';
import SudokuGrid from './components/SusGrid';
import { Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <SudokuGrid />
    </Container>
  );
}

export default App;
