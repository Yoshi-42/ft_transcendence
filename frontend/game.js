// Global variable to track the game instance
let currentGameInstance = null;

function createGame() {
    const gameTab = document.getElementById('game');
    gameTab.innerHTML = `
        <h1 class="display-4">Pong Game</h1>
        <p class="lead">Challenge yourself or play against the AI in our classic Pong game.</p>
        <div id="gameArea" class="mt-4"></div>
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
    let isGamePaused = false;
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
        ball.dy = 0;
    }

    function updateGame() {
        if (isGamePaused || isGameOver) return;

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
            ball.dy = initialBallSpeed * collidePoint;
        } else if (ball.x + ballSize > canvas.width - paddleWidth && collision(ball, ai)) {
            ball.dx = -Math.abs(ball.dx);
            let collidePoint = (ball.y - (ai.y + paddleHeight / 2)) / (paddleHeight / 2);
            ball.dy = initialBallSpeed * collidePoint;
        }

        // AI paddle movement
        aiMove();

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
            setTimeout(() => {
                alert(player.score === 5 ? "You win!" : "AI wins!");
                player.score = ai.score = 0;
                resetBall();
                isGameOver = false;
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

        // Draw pause message if game is paused
        if (isGamePaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawText("PAUSED", canvas.width / 2 - 70, canvas.height / 2, '#fff');
        }
    }

    function gameLoop() {
        updateGame();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function aiMove() {
        const currentTime = Date.now();
        if (currentTime - ai.lastMoveTime >= 1000) { // Make decision every second
            ai.targetY = ball.y - paddleHeight / 2;
            ai.targetY = Math.max(0, Math.min(canvas.height - paddleHeight, ai.targetY));
            ai.lastMoveTime = currentTime;
        }
        
        // Move towards the target position
        if (ai.y < ai.targetY) {
            ai.y += 2;
        } else if (ai.y > ai.targetY) {
            ai.y -= 2;
        }
        
        // Ensure AI paddle stays within the canvas
        ai.y = Math.max(0, Math.min(canvas.height - paddleHeight, ai.y));
    }

    // Event listener for player paddle
    function handleMouseMove(e) {
        if (!isGamePaused && !isGameOver) {
            let rect = canvas.getBoundingClientRect();
            player.y = e.clientY - rect.top - paddleHeight / 2;
            // Ensure player paddle stays within the canvas
            player.y = Math.max(0, Math.min(canvas.height - paddleHeight, player.y));
        }
    }

    canvas.addEventListener('mousemove', handleMouseMove);

    // Page Visibility API
    function handleVisibilityChange() {
        if (document.hidden) {
            isGamePaused = true;
            cancelAnimationFrame(animationFrameId);
        } else {
            isGamePaused = false;
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        drawGame(); // Redraw the game to show/hide pause message
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    function cleanup() {
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        gameTab.innerHTML = ''; // Clear the game area
    }

    // Start the game
    animationFrameId = requestAnimationFrame(gameLoop);

    // Return the cleanup function
    return cleanup;
}

// Make sure initGame is available globally
window.initGame = function() {
    // Clean up any existing game before starting a new one
    if (currentGameInstance) {
        currentGameInstance();
        currentGameInstance = null;
    }
    // Start a new game and store the cleanup function
    currentGameInstance = createGame();
};