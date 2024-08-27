// game.js

let DcurrentGameInstance = null;
let DisGameInitialized = false;
let DhasIncrementedLoss = false;
let DisGameActive = false;
let Dws = null;  // WebSocket variable

async function createGameD(options = {}) {
    console.log("Creating new game instance");
    if (DisGameInitialized) {
        console.warn("A game is already running. Please end the current game before starting a new one.");
        return null;
    }

    const gameTab = document.getElementById('game_online');
    if (!gameTab) {
        console.error("Game container not found. Make sure there's an element with id 'game' in your HTML.");
        return null;
    }

    const { onGameStart = null } = options;

    gameTab.innerHTML = `
        <h1 class="display-4">Pong Game</h1>
        <p class="lead">Challenge yourself or play against a friend in our classic Pong game.</p>
        <div id="gameArea" class="mt-4"></div>
        <button id="startGameBtn" class="btn btn-success mt-3">Start Game</button>
        <div id="gameLinkContainer" class="mt-3" style="display: none;">
            <p>Share this link with a friend to join the game:</p>
            <input type="text" id="gameLinkInput" readonly style="width: 100%;">
        </div>
    `;

    async function fetchGameLink() {
        try {
            const response = await fetch('http://localhost:8000/api/create-game/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to create game');
            }

            const data = await response.json();
            const gameLink = data.game_link;

            const gameLinkContainer = document.getElementById('gameLinkContainer');
            const gameLinkInput = document.getElementById('gameLinkInput');
            gameLinkInput.value = gameLink;
            gameLinkContainer.style.display = 'block';

            // Initialize WebSocket connection
            Dws = new WebSocket(`ws://localhost:8000/ws/game/${data.game_id}/`);
            
            Dws.onopen = () => {
                console.log("WebSocket connection opened.");
            };

            Dws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };

            Dws.onclose = () => {
                console.log("WebSocket connection closed.");
            };

            Dws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

        } catch (error) {
            console.error('Error creating game:', error);
            alert('Failed to create the game. Please try again.');
        }
    }

    // Appeler la fonction pour obtenir le lien du jeu
    fetchGameLink();

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
    let opponent = { y: canvas.height / 2 - paddleHeight / 2, score: 0 };
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

    function handleWebSocketMessage(message) {
        switch (message.type) {
            case 'game_start':
                startGame();
                break;
            case 'game_update':
                updateGameState(message.data);
                break;
            case 'game_over':
                endGame(message.winner);
                break;
            default:
                console.warn("Unknown message type:", message.type);
        }
    }

    function updateGameState(data) {
        player.y = data.player_y;
        opponent.y = data.opponent_y;
        ball.x = data.ball_x;
        ball.y = data.ball_y;
        ball.dx = data.ball_dx;
        ball.dy = data.ball_dy;
        player.score = data.player_score;
        opponent.score = data.opponent_score;

        drawGame();
    }

    function startGame() {
        DisGameInitialized = true;
        DisGameActive = true;
        DhasIncrementedLoss = false;
        isGameOver = false;
        document.getElementById('startGameBtn').style.display = 'none';
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function endGame(winner) {
        isGameOver = true;
        DisGameActive = false;
        alert(winner === 'player' ? "You win!" : "Opponent wins!");
        document.getElementById('startGameBtn').style.display = 'block';
    }

    function gameLoop() {
        if (!DisGameInitialized || !DisGameActive) return;
        updateGame();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function drawGame() {
        // Clear canvas
        drawRect(0, 0, canvas.width, canvas.height, '#000');

        // Draw paddles
        drawRect(0, player.y, paddleWidth, paddleHeight, '#fff');
        drawRect(canvas.width - paddleWidth, opponent.y, paddleWidth, paddleHeight, '#fff');

        // Draw ball
        drawCircle(ball.x, ball.y, ballSize, '#fff');

        // Draw scores
        drawText(player.score, canvas.width / 4, 50, '#fff');
        drawText(opponent.score, 3 * canvas.width / 4, 50, '#fff');
    }

    function updateGame() {
        if (isGameOver) return;

        // Move the ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top and bottom walls
        if (ball.y - ballSize < 0 || ball.y + ballSize > canvas.height) {
            ball.dy = -ball.dy;
        }

        // Send updated positions to server
        Dws.send(JSON.stringify({
            type: 'game_update',
            data: {
                player_y: player.y,
                ball_x: ball.x,
                ball_y: ball.y,
                ball_dx: ball.dx,
                ball_dy: ball.dy,
                player_score: player.score,
                opponent_score: opponent.score
            }
        }));
    }

    // Event listener for player paddle
    function handleMouseMove(e) {
        if (!isGameOver && DisGameActive) {
            let rect = canvas.getBoundingClientRect();
            player.y = e.clientY - rect.top - paddleHeight / 2;
            // Ensure player paddle stays within the canvas
            player.y = Math.max(0, Math.min(canvas.height - paddleHeight, player.y));
        }
    }

    canvas.addEventListener('mousemove', handleMouseMove);

    document.getElementById('startGameBtn').addEventListener('click', async () => {
        if (!DisGameActive) {
            console.log('Starting game...');
            startGame();
        }
    });

    return {
        stop: function () {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            canvas.removeEventListener('mousemove', handleMouseMove);
            gameTab.innerHTML = '';
            DisGameInitialized = false;
            DisGameActive = false;
            Dws.close();
        },
    };
}

function stopCurrentGameD() {
    if (DcurrentGameInstance) {
        DcurrentGameInstance.stop();
        DcurrentGameInstance = null;
    }
}

window.addEventListener('load', function () {
    const navItems = document.querySelectorAll('.navbar-nav .nav-link');

    navItems.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            const tabId = event.target.getAttribute('href').substring(1);
            const tabs = document.querySelectorAll('.tab-content .tab-pane');

            tabs.forEach(function (tab) {
                tab.classList.remove('active');
            });

            const currentTab = document.getElementById(tabId);
            currentTab.classList.add('active');

            if (tabId === 'game_online') {
                stopCurrentGameD();
                DcurrentGameInstance = createGameD({ onGameStart: function () { console.log("Game Started!") } });
            } else {
                stopCurrentGameD();
            }
        });
    });
});
