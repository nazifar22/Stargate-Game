document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 5;
    let playerPosition = { x: 2, y: 2 };
    let usedCells = [];

    let gameBoard = document.getElementById('game-board');

    let gameTimerInterval;

    const actionsPerWater = 3;

    let timeRemaining = 5 * 60;

    let items = [
        { name: 'Item 1', position: null, clues: [], imageUrl: 'https://i.ibb.co/FJKxhTN/Item-1.png', clueUrl: 'https://i.ibb.co/N6WH3r3/Item-1-clue.png' },
        { name: 'Item 2', position: null, clues: [], imageUrl: 'https://i.ibb.co/BZ1sVDB/Item-2.png', clueUrl: 'https://i.ibb.co/8mJ7ysN/Item-2-clue.png' },
        { name: 'Item 3', position: null, clues: [], imageUrl: 'https://i.ibb.co/PZSPtwk/Item-3.png', clueUrl: 'https://i.ibb.co/F3ddfZk/Item-3-clue.png' },
    ];

    // Define initial player state
    let playerState = {
        waterCount: 6,
        actionCount: 0,
        itemsDiscovered: [false, false, false], // Initially, no items are discovered
    };

    function initializeGame() {
        gameBoard.innerHTML = ''; // Clear previous board
        usedCells = []; // Reset used cells

        generateCells();
        setStargateBackground();
        placeOases();
        items.forEach((item, index) => { placeItemAndClues(index); });
        updatePlayerPosition();
        attachMovementControls();

        // Reset the player's action count to the maximum allowed actions per water unit
        playerState.actionCount = 0;
        updatePlayerStatusUI();
    }

    // Initialize the game timer
    function initializeTimer() {
        const timerElement = document.getElementById('game-timer');
        const gameTimerInterval = setInterval(() => {
            // Decrement the time remaining
            timeRemaining--;

            // Calculate minutes and seconds for display
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Check if time has run out
            if (timeRemaining <= 0) {
                clearInterval(gameTimerInterval);
                endGame(false); // Time is up, player has lost
            }
        }, 1000);
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

    function markUsed(x, y, properties = {}) {
        usedCells.push({ x, y, ...properties });
    }    

    function placeOases() {
        let oasisPositions = generateRandomOasesPositions(4, boardSize);
        let mirageIndex = Math.floor(Math.random() * oasisPositions.length); // Randomly choose one oasis to be a mirage
    
        oasisPositions.forEach((pos, index) => {
            const cells = document.querySelectorAll('#game-board .cell');
            const cellIndex = pos.y * boardSize + pos.x;
            cells[cellIndex].classList.add('oasis');
            // Use the updated markUsed to specify whether the cell is a mirage or not
            markUsed(pos.x, pos.y, { isOasis: true, isMirage: index === mirageIndex });
            console.log('Mirage is at:', mirageIndex); // Debugging
        });
    }
    
    function generateRandomOasesPositions(count, boardSize) {
        let positions = [];
        while (positions.length < count) {
            let position = getRandomPosition();
            if (position) { // Ensure position is not null
                positions.push(position);
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

    // Mark positions without setting background images
    function placeItemAndClues(itemIndex) {
        let itemPosition = getRandomBlankPosition();
        if (!itemPosition) return; // Exit if no position is available
        items[itemIndex].position = itemPosition;
        // Marking an item cell
        markUsed(itemPosition.x, itemPosition.y, { isItem: true, itemId: itemIndex });
        console.log('Item placed at:', itemPosition); // Debugging

        // Logic to place clues, now just marking their positions without revealing
        let rowCluePosition = getRandomBlankPositionInRow(itemPosition.y, [itemPosition.x]);
        let colCluePosition = getRandomBlankPositionInCol(itemPosition.x, [itemPosition.y], itemPosition.y);

        console.log('Item Row Clue is placed at:', rowCluePosition); // Debugging
        console.log('Item Column Clue is placed at:', colCluePosition); // Debugging

        items[itemIndex].clues = [rowCluePosition, colCluePosition];

        // Marking a clue cell
        markUsed(rowCluePosition.x, rowCluePosition.y, { isClue: true, itemId: itemIndex });
        markUsed(colCluePosition.x, colCluePosition.y, { isClue: true, itemId: itemIndex });
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
            return null;
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
            return null;
        }
    }

    // Function to handle the "Dig" action
    function digAtSelectedCell() {
        const selectedCellIndex = playerPosition.y * boardSize + playerPosition.x;
        const selectedCell = document.querySelectorAll('#game-board .cell')[selectedCellIndex];
        const cellContent = checkCellContent(playerPosition.x, playerPosition.y);

        console.log(cellContent); // Debugging line to see what content is found

        switch(cellContent.type) {
            case 'item':
                selectedCell.style.backgroundImage = `url(${cellContent.imageUrl})`;
                console.log('Item id is ', cellContent.itemId); // Debugging
                discoverItem(cellContent.itemId);
                break;
            case 'clue':
                selectedCell.style.backgroundImage = `url(${cellContent.clueUrl})`;
                break;
            case 'oasis':
                selectedCell.style.backgroundImage = cellContent.isMirage ? `url(https://i.ibb.co/CPsjJ7H/Drought.png)` : `url(https://i.ibb.co/7v4CQ6n/Oasis.png)`;
                console.log('Oasis action executed'); // Debugging

                if (!cellContent.isMirage) {
                    playerState.waterCount = 6; // Replenish water to full
                    playerState.actionCount = 0; // Reset action count
                    updatePlayerStatusUI();
                }

                break;
            case 'nothing':
                selectedCell.style.backgroundImage = `url(https://i.ibb.co/nPdbJJX/Hole.png)`;
                break;
        }

        performAction();
        console.log('Dig action count executed'); // Debugging
    }

    function checkCellContent(x, y) {
        const cell = usedCells.find(cell => cell.x === x && cell.y === y);

        if (!cell) return { type: 'nothing' };

        if (cell.isOasis) {
            return { type: 'oasis', isMirage: cell.isMirage };
        }
        if (cell.isItem) {
            const item = items[cell.itemId];
            return { type: 'item', imageUrl: item.imageUrl, itemId: cell.itemId};
        }
        if (cell.isClue) {
            const item = items[cell.itemId];
            return { type: 'clue', clueUrl: item.clueUrl };
        }

        return { type: 'unknown' };
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
        document.getElementById('move-up').addEventListener('click', () => {movePlayer('up'); performAction()});
        document.getElementById('move-down').addEventListener('click', () => {movePlayer('down'); performAction()});
        document.getElementById('move-left').addEventListener('click', () => {movePlayer('left'); performAction()});
        document.getElementById('move-right').addEventListener('click', () => {movePlayer('right'); performAction()});
        document.getElementById('dig').addEventListener('click', digAtSelectedCell);

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            let validKey = false;
            if (e.key === 'ArrowUp') { movePlayer('up'); validKey = true; }
            if (e.key === 'ArrowDown') { movePlayer('down'); validKey = true; }
            if (e.key === 'ArrowLeft') { movePlayer('left'); validKey = true; }
            if (e.key === 'ArrowRight') { movePlayer('right'); validKey = true; }
            if (e.key === 'Enter') { digAtSelectedCell(); validKey = false; }

            if (validKey) performAction();
        });
    }

    // Initialize the discovered items list
    function initializeItemsDiscovered() {
        const itemsList = document.getElementById('items-discovered');
        items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.id = `item-${index}`;
            listItem.style.backgroundImage = `url(${item.imageUrl})`;
            listItem.style.opacity = 0.4; // Item not discovered, set to 40% opacity
            itemsList.appendChild(listItem);
        });
    }

    // Call this function whenever an action is performed
    function performAction() {
        playerState.actionCount++;

        console.log('Action count:', playerState.actionCount); // Debugging

        if (playerState.actionCount >= actionsPerWater) {
            playerState.waterCount--;
            playerState.actionCount = 0; // Reset the action count
            updatePlayerStatusUI();
    
            // End the game if water count is 0
            if (playerState.waterCount === 0) {
                endGame(false); // Player has lost
            }
        }
        updatePlayerStatusUI();
    }

    // Update the UI for player status
    function updatePlayerStatusUI() {
        document.getElementById('water-count').textContent = playerState.waterCount;
        document.getElementById('action-count').textContent = playerState.actionCount;
    }

    // Call this function when an item is discovered
    function discoverItem(itemIndex) {
        playerState.itemsDiscovered[itemIndex] = true;
        const itemElement = document.getElementById(`item-${itemIndex}`);
        itemElement.style.opacity = 1; // Item discovered, set to 100% opacity

        // Check if all items are discovered for victory
        if (playerState.itemsDiscovered.every(discovered => discovered)) {
            endGame(true); // Player has won
        }
    }

    // End the game
    function endGame(isVictory) {
        // Stop the timer
        clearInterval(gameTimerInterval);

        // Display a message based on the result
        const message = isVictory ? 'Victory! You have found all items.' : 'Game Over! You Lose.';
        alert(message);

        // Ask the player if they want to restart the game
        const restart = confirm("Do you want to play again?");
        if (restart) {
            // Refresh the page to start a new game
            window.location.reload();
        } else {
        // Disable all controls to prevent further actions
        document.querySelectorAll('button').forEach(button => button.disabled = true);
        }
    }

    initializeGame();
    initializeItemsDiscovered();
    initializeTimer();
});
