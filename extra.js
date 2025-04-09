document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 5;
    let playerPosition = { x: 2, y: 2 };
    let usedCells = [];

    let gameBoard = document.getElementById('game-board');

    let items = [
        { name: 'Item 1', position: null, clues: [], imageUrl: 'https://i.ibb.co/FJKxhTN/Item-1.png', clueUrl: 'https://i.ibb.co/N6WH3r3/Item-1-clue.png' },
        { name: 'Item 2', position: null, clues: [], imageUrl: 'https://i.ibb.co/BZ1sVDB/Item-2.png', clueUrl: 'https://i.ibb.co/8mJ7ysN/Item-2-clue.png' },
        { name: 'Item 3', position: null, clues: [], imageUrl: 'https://i.ibb.co/PZSPtwk/Item-3.png', clueUrl: 'https://i.ibb.co/F3ddfZk/Item-3-clue.png' },
    ];

    function initializeGame() {
        gameBoard.innerHTML = ''; // Clear previous board
        usedCells = []; // Reset used cells

        generateCells();
        setStargateBackground();
        placeOases();
        items.forEach((item, index) => { placeItemAndClues(index); });
        updatePlayerPosition();
        attachMovementControls();
    }

    function generateCells() {
        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
        }
    }

    function setStargateBackground() {
        const centerIndex = playerPosition.y * boardSize + playerPosition.x;
        const cells = document.querySelectorAll('#game-board .cell');
        cells[centerIndex].classList.add('stargate');
        markUsed(playerPosition.x, playerPosition.y);
    }

    function markUsed(x, y) {
        usedCells.push({ x, y });
    }

    function placeOases() {
        let oasisPositions = generateRandomOasesPositions(4, boardSize);
        oasisPositions.forEach(pos => {
            const index = pos.y * boardSize + pos.x;
            const cells = document.querySelectorAll('#game-board .cell');
            cells[index].classList.add('oasis');
            console.log('Applying oasis class to index:', index); // Debugging
        });
    }

    function generateRandomOasesPositions(count, boardSize) {
        let positions = [];
        while (positions.length < count) {
            let position = getRandomPosition();
            if (position) { // Ensure position is not null
                positions.push(position);
                markUsed(position.x, position.y); // Mark the position as used
                console.log('Oasis at:', position); // Debugging
            }
        }
        return positions;
    }

    function getRandomPosition() {
        let availablePositions = [];
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                if (!usedCells.some(usedCell => usedCell.x === x && usedCell.y === y)) {
                    availablePositions.push({ x, y });
                }
            }
        }
        if (availablePositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            return availablePositions[randomIndex];
        } else {
            return null; // No available positions
        }
    }

    function placeItemAndClues(itemIndex) {
        let itemPosition = getRandomBlankPosition();
        if (!itemPosition) return; // Exit if no position is available
        items[itemIndex].position = itemPosition;
        markUsed(itemPosition.x, itemPosition.y);
    
        // Set the background image for the item
        const itemCellIndex = itemPosition.y * boardSize + itemPosition.x;
        document.querySelectorAll('#game-board .cell')[itemCellIndex].style.backgroundImage = `url(${items[itemIndex].imageUrl})`;
        console.log('Item placed at:', itemPosition); // Debugging
    
        // Place clues, ensuring they're placed in the same row and column but not on the item or each other
        let rowCluePosition = getRandomBlankPositionInRow(itemPosition.y, [itemPosition.x]);
        let colCluePosition = getRandomBlankPositionInCol(itemPosition.x, [itemPosition.y], itemPosition.y);
        console.log('Item Row Clue is placed at:', rowCluePosition); // Debugging
        console.log('Item Column Clue is placed at:', colCluePosition); // Debugging
    
        items[itemIndex].clues = [rowCluePosition, colCluePosition];
        markUsed(rowCluePosition.x, rowCluePosition.y);
        markUsed(colCluePosition.x, colCluePosition.y);
    
        // Set background images for clues
        document.querySelectorAll('#game-board .cell')[rowCluePosition.y * boardSize + rowCluePosition.x].style.backgroundImage = `url(${items[itemIndex].clueUrl})`;
        document.querySelectorAll('#game-board .cell')[colCluePosition.y * boardSize + colCluePosition.x].style.backgroundImage = `url(${items[itemIndex].clueUrl})`;
    }
    
    // Updated to ensure it uses only available positions
    function getRandomBlankPosition() {
        return getRandomPosition();
    }
    
    function getRandomBlankPositionInRow(row, excludeCols = []) {
        let potentialPositions = [];
        for (let col = 0; col < boardSize; col++) {
            if (!excludeCols.includes(col) && !usedCells.some(cell => cell.x === col && cell.y === row)) {
                potentialPositions.push({ x: col, y: row });
            }
        }
        if (potentialPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * potentialPositions.length);
            return potentialPositions[randomIndex];
        } else {
            return null; // Handle the case where no position is available
        }
    }
    
    function getRandomBlankPositionInCol(col, excludeRows = [], itemRow = null) {
        let potentialPositions = [];
        for (let row = 0; row < boardSize; row++) {
            if (row !== itemRow && !excludeRows.includes(row) && !usedCells.some(cell => cell.x === col && cell.y === row)) {
                potentialPositions.push({ x: col, y: row });
            }
        }
        if (potentialPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * potentialPositions.length);
            return potentialPositions[randomIndex];
        } else {
            return null; // Handle the case where no position is available
        }
    }



    function updatePlayerPosition() {
        const cells = document.querySelectorAll('#game-board .cell');
        cells.forEach(cell => cell.classList.remove('player')); // Clear previous position
    
        const playerCellIndex = playerPosition.y * boardSize + playerPosition.x;
        if (cells[playerCellIndex]) {
            cells[playerCellIndex].classList.add('player');
        }
    }    

    function movePlayer(direction) {
        switch (direction) {
            case 'up':    if (playerPosition.y > 0) playerPosition.y -= 1; break;
            case 'down':  if (playerPosition.y < boardSize - 1) playerPosition.y += 1; break;
            case 'left':  if (playerPosition.x > 0) playerPosition.x -= 1; break;
            case 'right': if (playerPosition.x < boardSize - 1) playerPosition.x += 1; break;
        }
        updatePlayerPosition();
    }

    function attachMovementControls() {
        document.getElementById('move-up').addEventListener('click', () => movePlayer('up'));
        document.getElementById('move-down').addEventListener('click', () => movePlayer('down'));
        document.getElementById('move-left').addEventListener('click', () => movePlayer('left'));
        document.getElementById('move-right').addEventListener('click', () => movePlayer('right'));

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') movePlayer('up');
            if (e.key === 'ArrowDown') movePlayer('down');
            if (e.key === 'ArrowLeft') movePlayer('left');
            if (e.key === 'ArrowRight') movePlayer('right');
        });
    }

    initializeGame();
});
