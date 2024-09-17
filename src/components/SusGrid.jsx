import React, { useState } from 'react';
import { TextField, Button, Typography, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';
import '../assets/SudokuGrid.css';

// Shuffle array function for randomness in generation
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
                let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Randomized numbers
                for (let num of numbers) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        setBoard([...board]);
                        setSolvedCells(prev => [...prev, { row, col }]);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        if (await fillBoardWithSteps(board, setBoard, setSolvedCells)) {
                            return true;
                        }
                        board[row][col] = 0; // Backtrack
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
                let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Randomized numbers
                for (let num of numbers) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoardBacktracking(board)) {
                            return true;
                        }
                        board[row][col] = 0; // Backtrack
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const generateSudoku = (difficulty) => {
    const fullBoard = Array(9).fill().map(() => Array(9).fill(0));
    fillBoardBacktracking(fullBoard); // Randomized board generation

    const puzzleBoard = fullBoard.map(row => [...row]);

    const cellsToRemove = difficulty === 'Easy' ? 40 : difficulty === 'Medium' ? 50 : 70; // Adjust difficulty level
    let count = 0;

    while (count < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzleBoard[row][col] !== 0) {
            puzzleBoard[row][col] = 0;
            count++;
        }
    }

    return puzzleBoard;
};

const checkSolution = (board) => {
    // Ensure every cell is filled
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) return false; // Invalid if any cell is empty
        }
    }

    // Check rows, columns, and 3x3 subgrids
    for (let i = 0; i < 9; i++) {
        const row = new Set();
        const col = new Set();
        const subGrid = new Set();

        for (let j = 0; j < 9; j++) {
            if (row.has(board[i][j])) return false;
            row.add(board[i][j]);

            if (col.has(board[j][i])) return false;
            col.add(board[j][i]);

            const subRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
            const subCol = 3 * Math.floor(i % 3) + (j % 3);
            if (subGrid.has(board[subRow][subCol])) return false;
            subGrid.add(board[subRow][subCol]);
        }
    }
    return true;
};

const SudokuGrid = () => {
    const [board, setBoard] = useState(generateSudoku('Medium'));
    const [solvedCells, setSolvedCells] = useState([]);
    const [manualMode, setManualMode] = useState(false); // State to enable/disable manual input mode
    const [difficulty, setDifficulty] = useState('Medium'); // State to manage difficulty
    const [checkResult, setCheckResult] = useState(null); // State to manage check result

    const handleSolve = async () => {
        const newBoard = [...board.map(row => [...row])];
        setSolvedCells([]);
        await fillBoardWithSteps(newBoard, setBoard, setSolvedCells); // Visual Backtracking
    };

    const handleNewGame = () => {
        setSolvedCells([]);
        setBoard(generateSudoku(difficulty));
        setCheckResult(null);
    };

    const handleCheckSolution = () => {
        const result = checkSolution(board);
        setCheckResult(result ? 'Congratulations! Your solution is correct !' : 'Oops! The solution is incorrect.');
    };

    const getBackgroundColor = (rowIndex, colIndex) => {
        const isGrey = (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0;
        return isGrey ? '#f0f0f0' : 'white';
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
                                backgroundColor: isSolvedCell ? '#c8e6c9' : getBackgroundColor(rowIndex, colIndex),
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

            {/* Difficulty Selector */}
            <FormControl variant="outlined" sx={{ marginBottom: '20px' }}>
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                    labelId="difficulty-label"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    label="Difficulty"
                >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                </Select>
            </FormControl>

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
                <Button variant="contained" color="success" onClick={handleCheckSolution}>
                    Check Solution
                </Button>
            </div>
            {checkResult && (
                <Typography variant="h6" align="center" sx={{ marginTop: '20px', color: checkResult.includes('Your') ? 'green' : 'red' }}>
                    {checkResult}
                </Typography>
            )}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '20px',
                    color: 'black',
                    '& img': {
                        marginRight: '5px',
                    },
                }}
            >
                <img src="https://img.icons8.com/ios-glyphs/30/000000/github.png" alt="GitHub" />
                <Typography variant="body1">
                    Star the repo if you like it! Fork it to create your own version!
                    <a href="https://github.com/crizmo/sudoku-solver" target="_blank" rel="noreferrer"
                        style={{ color: 'blue', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        GitHub
                    </a>
                </Typography>
            </Box>
        </div>
    );
};

export default SudokuGrid;