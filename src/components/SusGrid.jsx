import React, { useState } from 'react';
import { TextField, Button, Typography, FormControlLabel, Checkbox } from '@mui/material';
import '../assets/SudokuGrid.css';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const isValidPlacement = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) {
            return false;
        }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    return true;
};

const fillBoardWithSteps = async (board, setBoard, setSolvedCells) => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); 
                for (let num of numbers) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        setBoard([...board]);
                        setSolvedCells(prev => [...prev, { row, col }]);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        if (await fillBoardWithSteps(board, setBoard, setSolvedCells)) {
                            return true;
                        }
                        board[row][col] = 0; 
                        setBoard([...board]);
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const fillBoardBacktracking = (board) => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (let num of numbers) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoardBacktracking(board)) {
                            return true;
                        }
                        board[row][col] = 0; 
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const generateSudoku = () => {
    const fullBoard = Array(9).fill().map(() => Array(9).fill(0));
    fillBoardBacktracking(fullBoard); 

    const puzzleBoard = fullBoard.map(row => [...row]);

    const difficulty = 70; 
    let count = 0;

    while (count < difficulty) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzleBoard[row][col] !== 0) {
            puzzleBoard[row][col] = 0;
            count++;
        }
    }

    return puzzleBoard;
};

const SudokuGrid = () => {
    const [board, setBoard] = useState(generateSudoku());
    const [solvedCells, setSolvedCells] = useState([]);
    const [manualMode, setManualMode] = useState(false); 

    const handleSolve = async () => {
        const newBoard = [...board.map(row => [...row])];
        setSolvedCells([]);
        await fillBoardWithSteps(newBoard, setBoard, setSolvedCells); 
    };

    const handleNewGame = () => {
        setSolvedCells([]);
        setBoard(generateSudoku());
    };

    const renderBoard = () =>
        board.map((row, rowIndex) => (
            <div className="sudoku-row" key={rowIndex}>
                {row.map((num, colIndex) => {
                    const isSolvedCell = solvedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
                    return (
                        <TextField
                            key={colIndex}
                            variant="outlined"
                            size="small"
                            value={num === 0 ? '' : num}
                            inputProps={{ style: { textAlign: 'center' } }}
                            onChange={e => {
                                if (manualMode) { // Allow input only in manual mode
                                    if (!isNaN(e.target.value) && e.target.value >= 0 && e.target.value <= 9) {
                                        board[rowIndex][colIndex] = e.target.value === '' ? 0 : parseInt(e.target.value);
                                        setBoard([...board]);
                                    }
                                }
                            }}
                            sx={{
                                backgroundColor: isSolvedCell ? '#c8e6c9' : 'white',
                                '& input': {
                                    color: isSolvedCell ? 'green' : 'black',
                                    fontWeight: isSolvedCell ? 'bold' : 'normal',
                                },
                            }}
                        />
                    );
                })}
            </div>
        ));

    return (
        <div className="sudoku-container">
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '20px', color: 'black' }}>
                Sudoku Solver
            </Typography>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={manualMode}
                        onChange={() => setManualMode(!manualMode)}
                        color="primary"
                    />
                }
                label="Manual Input Mode"
                sx={{ 
                    marginBottom: '20px',
                    color: 'black'
                }}
            />

            <div className="board-container">{renderBoard()}</div>
            <div className="buttons-container">
                <Button variant="contained" color="primary" onClick={handleSolve} disabled={manualMode && solvedCells.length === 0}>
                    Solve Sudoku
                </Button>
                <Button variant="contained" color="secondary" onClick={handleNewGame}>
                    New Game
                </Button>
            </div>
        </div>
    );
};

export default SudokuGrid;
