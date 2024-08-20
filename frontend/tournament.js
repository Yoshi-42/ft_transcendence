// tournament.js


let players = [];

function initTournament() {
    const tournamentTab = document.getElementById('tournament');
    tournamentTab.innerHTML = `
        <h1 class="display-4">Tournament Page</h1>
        <p class="lead">Join our exciting tournaments and win amazing prizes!</p>
        <hr class="my-4">
        <p>Check out the upcoming tournaments or view the results of past ones.</p>
        
        <div class="mb-3">
            <label for="playerName" class="form-label">Player Name</label>
            <input type="text" id="playerName" class="form-control" placeholder="Enter player name">
        </div>
        <button id="addPlayerBtn" class="btn btn-primary mb-3">Add Player</button>

        <h3>Players:</h3>
        <ul id="playerList" class="list-group mb-4"></ul>
 
        <button id="joinTournamentBtn" class="btn btn-success">Join Tournament</button>
    `;
    console.log("Tournament initialized!");
   
    
    document.getElementById('addPlayerBtn').addEventListener('click', () => {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();

    if (playerName) {
        players.push(playerName);

        // Mettre à jour la liste des joueurs affichée
        const playerList = document.getElementById('playerList');
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = playerName;
        playerList.appendChild(listItem);

         // Vider le champ de saisie après l'ajout
        playerNameInput.value = '';
    }
    });


    document.getElementById('joinTournamentBtn').addEventListener('click', () => {
    if (players.length > 1) {
        console.log("Players joining the tournament:");
        players.forEach(player => console.log(player));
        console.log("Start the tournament");
        startTournament(players);
    } else {
        console.log("No enough players have been added yet.");
    }
	});


}

function startTournament(players) {
    console.log("Starting the tournament with the following players:");
    console.log(players);

    // Mélanger les joueurs pour créer un ordre aléatoire
    players = shuffleArray(players);
    playRound(players);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function playRound(players) {
    console.log("New Round Starting!");
    const winners = [];
    
    const playMatch = async (player1, player2) => {
        console.log(`Starting match between ${player1} and ${player2}`);

        // Start the game and wait for the winner to be determined
        const winner = await startGameWithPlayers(player1, player2);
        winners.push(winner);
        console.log(`${player1} vs ${player2} - Winner: ${winner}`);
    };
    
    
    
    const handleRound = async () => {
        while (players.length > 1) {
            const player1 = players.pop();
            const player2 = players.pop();

            await playMatch(player1, player2);
        }


    // Si le nombre de joueurs est impair, le dernier joueur est qualifié d'office
    if (players.length === 1) {
        winners.push(players.pop());
    }

    if (winners.length > 1) {
        playRound(winners);
    } else {
        console.log(`Tournament Champion: ${winners[0]}`);
    }
    };
    
    handleRound();
}


function startGameWithPlayers(player1, player2) {
    return new Promise((resolve, reject) => {
        console.log(`Starting the game between ${player1} and ${player2}`);
        
        // Initialize the game
        window.initGame({
            onGameStart: () => console.log('Game started!'),
            onGameEnd: (winner) => {
                console.log(`Game ended. Winner: ${winner}`);
                resolve(winner);
            }
        }, player1, player2);

        // Mock the gameEnd event listener for demo purposes
        setTimeout(() => {
            // This should be replaced by the actual game logic to determine the winner
            const winner = Math.random() > 0.5 ? player1 : player2; 
            resolve(winner);
        }, 5000); // Simulate game duration
    });
}










let isUpPressed = false;
let isDownPressed = false;
let isGameOver = false;
let isGameActive = true;


let currentGameInstance = null;
let isGameInitialized = false;
let hasIncrementedLoss = false;
let isGameActive = false;

async function createGame(options = {}, player1, player2) {
    console.log("Creating new game instance");
    if (isGameInitialized) {
        console.warn("A game is already running. Please end the current game before starting a new one.");
        return null;
    }

    const gameTab = document.getElementById('game');
    if (!gameTab) {
        console.error("Game container not found. Make sure there's an element with id 'game' in your HTML.");
        return null;
    }

    const { onGameStart = null , OnGameEnd = null } = options;

    gameTab.innerHTML = `
        <h1 class="display-4">Pong Game</h1>
        <p class="lead">Challenge yourself or play against the AI in our classic Pong game.</p>
        <div id="gameArea" class="mt-4"></div>
        <p> ${player1} VS ${player2} </p>
        <button id="startGameBtn" class="btn btn-success mt-3">Start Game</button>
    `;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    document.getElementById('gameArea').appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Game variables
    const paddleWidth = 10;
    const paddleHeight = 60;
    const ballSize = 10;
    const initialBallSpeed = 5;
    let player = { y: canvas.height / 2 - paddleHeight / 2, score: 0 };
    let ai = { y: canvas.height / 2 - paddleHeight / 2, score: 0, lastMoveTime: 0, targetY: canvas.height / 2 - paddleHeight / 2 };
    let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: initialBallSpeed, dy: 0 };
    let animationFrameId = null;
    let isGameOver = false;

    // Game functions
    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawCircle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawText(text, x, y, color) {
        ctx.fillStyle = color;
        ctx.font = '30px Arial';
        ctx.fillText(text, x, y);
    }

    function collision(b, p) {
        return b.y + ballSize > p.y && b.y - ballSize < p.y + paddleHeight;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = initialBallSpeed * (Math.random() * 2 - 1); // Random vertical direction
    }

    async function updateWinLossCount(isWin) {
        const endpoint = isWin ? 'http://localhost:8000/api/user/increment_wins/' : 'http://localhost:8000/api/user/increment_losses/';
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to update win/loss count');
            }
            const data = await response.json();
            console.log(isWin ? `Wins updated: ${data.wins}` : `Losses updated: ${data.losses}`);
        } catch (error) {
            console.error('Error updating win/loss count:', error);
        }
    }

    async function incrementLossCount() {
        if (!hasIncrementedLoss) {
            await updateWinLossCount(false);
            hasIncrementedLoss = true;
        }
    }

    async function updateGame() {
        if (isGameOver) return;

        // Move the ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top and bottom walls
        if (ball.y - ballSize < 0 || ball.y + ballSize > canvas.height) {
            ball.dy = -ball.dy;
        }

        // Ball collision with paddles
        if (ball.x - ballSize < paddleWidth && collision(ball, player)) {
            ball.dx = Math.abs(ball.dx);
            let collidePoint = (ball.y - (player.y + paddleHeight / 2)) / (paddleHeight / 2);
            ball.dy = initialBallSpeed * 1.5 * collidePoint;
        } else if (ball.x + ballSize > canvas.width - paddleWidth && collision(ball, ai)) {
            ball.dx = -Math.abs(ball.dx);
            let collidePoint = (ball.y - (ai.y + paddleHeight / 2)) / (paddleHeight / 2);
            ball.dy = initialBallSpeed * 1.5 * collidePoint;
        }

        // AI paddle movement
       	
        // Scoring
        if (ball.x - ballSize < 0) {
            ai.score++;
            resetBall();
        } else if (ball.x + ballSize > canvas.width) {
            player.score++;
            resetBall();
        }

        // Check for game over
        if (player.score === 5 || ai.score === 5) {
            isGameOver = true;
            isGameActive = false;
            const playerWon = player.score === 5;
            await updateWinLossCount(playerWon);
            setTimeout(() => {
                alert(playerWon ? "You win!" : "AI wins!");
                player.score = ai.score = 0;
                resetBall();
                isGameOver = false;
                isGameInitialized = false;
                hasIncrementedLoss = false;
                document.getElementById('startGameBtn').style.display = 'block';
                drawGame();
            }, 100);
        }
    }

    function drawGame() {
        // Clear canvas
        drawRect(0, 0, canvas.width, canvas.height, '#000');

        // Draw paddles
        drawRect(0, player.y, paddleWidth, paddleHeight, '#fff');
        drawRect(canvas.width - paddleWidth, ai.y, paddleWidth, paddleHeight, '#fff');

        // Draw ball
        drawCircle(ball.x, ball.y, ballSize, '#fff');

        // Draw scores
        drawText(player.score, canvas.width / 4, 50, '#fff');
        drawText(ai.score, 3 * canvas.width / 4, 50, '#fff');
    }

    function gameLoop() {
        if (!isGameInitialized || !isGameActive) return;
        updateGame();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

  ////PLayer 1  Control////    
    function handleKeyDown(e) {
    if (!isGameOver && isGameActive) {
        if (e.key === 'Z') {
            isUpPressed = true;
        } else if (e.key === 'S') {
            isDownPressed = true;
        }
    }
}

	function handleKeyUp(e) {
    if (!isGameOver && isGameActive) {
        if (e.key === 'Z') {
            isUpPressed = false;
        } else if (e.key === 'S') {
            isDownPressed = false;
        }
    }
}


function updatePlayerPosition() {
    if (isUpPressed) {
        player.y -= player.speed;
        player.y = Math.max(0, player.y);  // Empêche de dépasser le bord supérieur du canvas
    }
    if (isDownPressed) {
        player.y += player.speed;
        player.y = Math.min(canvas.height - paddleHeight, player.y);  // Empêche de dépasser le bord inférieur du canvas
    }
}

///Fin player 1 Controle  
    
////PLayer 2  Control////    
    function aihandleKeyDown(e) {
    if (!isGameOver && isGameActive) {
        if (e.key === 'ArrowUp') {
            isUpPressed = true;
        } else if (e.key === 'ArrowDown') {
            isDownPressed = true;
        }
    }
}

	function aihandleKeyUp(e) {
    if (!isGameOver && isGameActive) {
        if (e.key === 'ArrowUp') {
            isUpPressed = false;
        } else if (e.key === 'ArrowDown') {
            isDownPressed = false;
        }
    }
}


function aiupdatePlayerPosition() {
    if (isUpPressed) {
        ai.y -= ai.speed;
        ai.y = Math.max(0, ai.y);  // Empêche de dépasser le bord supérieur du canvas
    }
    if (isDownPressed) {
        ai.y += ai.speed;
        ai.y = Math.min(canvas.height - paddleHeight, ai.y);  // Empêche de dépasser le bord inférieur du canvas
    }
}

///Fin player 2 Controle
    
    

    //canvas.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', aihandleKeyUp);
	document.addEventListener('keyup', aihandleKeyUp);

    // Page Visibility API
    async function handleVisibilityChange() {
        console.log('Visibility changed. Hidden:', document.hidden);
        console.log('Game state - Initialized:', isGameInitialized, 'Active:', isGameActive, 'Over:', isGameOver);

        if (document.hidden && isGameInitialized && isGameActive && !isGameOver && !hasIncrementedLoss) {
            console.log('Player left the game. Counting as a loss.');
            await incrementLossCount();
            isGameOver = true;
            isGameActive = false;
            cancelAnimationFrame(animationFrameId);
            alert("You left the game. This counts as a loss.");
            document.getElementById('startGameBtn').style.display = 'block';
        } else if (!document.hidden && isGameInitialized && isGameActive && !isGameOver) {
            console.log('Tab is visible again. Resuming game.');
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        drawGame();
    }

    // Ensure we remove the previous event listener before adding a new one
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', async () => {
        if (!isGameActive) {
            console.log('Start game button clicked');
            try {
                console.log('Sending request to increment games_played');
                const response = await fetch('http://localhost:8000/api/user/increment_games_played/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to increment games played');
                }
                const data = await response.json();
                console.log('Response data:', data);
                
                isGameInitialized = true;
                isGameActive = true;
                hasIncrementedLoss = false;
                isGameOver = false;
                document.getElementById('startGameBtn').style.display = 'none';
                animationFrameId = requestAnimationFrame(gameLoop);
                if (typeof onGameStart === 'function') {
                    onGameStart();
                }
            } catch (error) {
                console.error('Error starting game:', error);
                alert('Failed to start the game. Please try again.');
            }
        } else {
            console.log('Game already active, ignoring click');
        }
    });

    // Initial draw
    drawGame();

    // Cleanup function
    function cleanup() {
        console.log("Cleanup function called");
        isGameInitialized = false;
        isGameActive = false;
        hasIncrementedLoss = false;
        isGameOver = false;
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        gameTab.innerHTML = ''; // Clear the game area
    }

    // Return the cleanup function
    return cleanup;
}

// Make sure initGame is available globally
window.initGame = function(options = {}) {
    console.log("Initializing new game");
    // Clean up any existing game before starting a new one
    if (currentGameInstance) {
        console.log("Cleaning up existing game");
        currentGameInstance();
        currentGameInstance = null;
    }
    // Start a new game and store the cleanup function
    currentGameInstance = createGame(options);
    console.log("New game initialized, cleanup function stored");
};











