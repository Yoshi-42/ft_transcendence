let current3DGameInstance = null;
let is3DGameInitialized = false;

let P1isUpPresse3D = false;
let P1isDownPressed3D = false;

let heightBoard = 7;
let widthBoard = 15;

let speed3D = 0.05;


async function create3DPong(options = {}) {
    if (is3DGameInitialized) {
        console.warn("3D game already running.");
        return null;
    }

    const gameTab = document.getElementById('3d_pong');
    if (!gameTab) {
        console.error("Game container not found.");
        return null;
    }

    const { onGameStart = null } = options;

    gameTab.innerHTML = `
        <h1 class="display-4">3D Pong Game</h1>
        <p class="lead">Play Pong in 3D!</p>
        <div id="3dGameArea" class="mt-4"></div>
        <button id="start3DGameBtn" class="btn btn-success mt-3">Start 3D Game</button>
    `;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 400);
    document.getElementById('3dGameArea').appendChild(renderer.domElement);

    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.0,    // Force du glow
        0.2,    // Rayon
        0.85    // Seuil
    );
    composer.addPass(bloomPass);

    

    // Paddle and ball geometry
    const paddleWidth = 1, paddleHeight = 3, paddleDepth = 0.5;
    const ballSize = 0.5;

    //AI variables
    let lastMoveTime = 0;
    let targetY = heightBoard / 2;
    let aiReactionDelay = 0;
    let aiAccuracy = 0.9;
    let aiPredictionError = 0;
    let aiMovementSpeed = 0.05;


    //const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);

    const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    const ballGeometry = new THREE.SphereGeometry(ballSize, 32, 32);
    //const floorGeometry = new THREE.PlaneGeometry(18, 18);
    const wallGeometry = new THREE.BoxGeometry(widthBoard * 2, 0.5, 0.5); 
	const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    //const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
    //const floorMaterial = new THREE.MeshStandardMaterial({color : 0x0000aa, metalness : 0.9, roughtness : 0.1});
    // const floorMaterial = new THREE.MeshStandardMaterial({
    //     color: 0x000000, // Noir pour un effet sobre
    //     metalness: 0.8,  // Reflets métalliques
    //     roughness: 0.2,  // Un peu de rugosité pour ne pas avoir un miroir parfait
    //     //envMap: cubeTexture // Ajouter une map environnementale pour des réflexions
    //   });
    //const glowingMaterial = new THREE.MeshStandardMaterial({color : 0xffffff, emissive : 0xffa500 , emissiveIntensity : 1.5 })
    const glowingMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Couleur principale (blanche)
        emissive: 0xffffff, // Couleur d'émission (glow)
        emissiveIntensity: 1.0, // Intensité de la lumière
      });

    

    const playerPaddle = new THREE.Mesh(paddleGeometry, material);
    const leftWall = new THREE.Mesh(wallGeometry, glowingMaterial);
	const rightWall = new THREE.Mesh(wallGeometry, glowingMaterial);
    const aiPaddle = new THREE.Mesh(paddleGeometry, material);
    const ball = new THREE.Mesh(ballGeometry, material);
    //const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    // Positions
    playerPaddle.position.set(-widthBoard + 1, 0, 0);
    aiPaddle.position.set(widthBoard - 1, 0, 0);
    ball.position.set(0, 0, 0);
    //floor.position.set(0, 0, -0.3);
    //var Y_AXIS = new THREE.Vector3(0 , 1 , 0);
	camera.position.z = 10;
	camera.position.x = -15;
	//camera.lookAt(aiPaddle);
	camera.rotation.y = Math.PI * -0.2;
	camera.rotation.z = Math.PI * -0.5;
	
	leftWall.position.set( 0, -widthBoard / 2, 0);  // Mur à gauche
	rightWall.position.set(0, widthBoard / 2, 0);  // Mur à droite

	
	
    // Add objects to scene
    //scene.add(light);
    scene.add(playerPaddle);
    scene.add(aiPaddle);
    scene.add(ball);
	scene.add(leftWall);
	scene.add(rightWall);
    //scene.add(floor);

    // Lighting (optional)
    //const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    //scene.add(ambientLight);
    const light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(0, 10, 0);
    scene.add(light);


    // Camera position
    //camera.position.set(0, 5, -15);
	//camera.lookAt(0, 0, 0);
    

    // Game variables
    let playerScore = 0;
    let aiScore = 0;
    let ballSpeedX = 0.1, ballSpeedY = 0.05;


    function animate() {
        requestAnimationFrame(animate);
        composer.render();
    }
    animate();

    // Game functions
    function updateGame() {
        ball.position.x += ballSpeedX;
        ball.position.y += ballSpeedY;
        animate();
        // Collision with top/bottom walls
        if (ball.position.y + ballSize > heightBoard || ball.position.y - ballSize < -heightBoard) {
            ballSpeedY = -ballSpeedY;
        }

        // Collision with paddles
        if (ball.position.x - ballSize < playerPaddle.position.x + paddleWidth / 2 &&
            ball.position.y < playerPaddle.position.y + paddleHeight / 2  &&
            ball.position.y > playerPaddle.position.y - paddleHeight / 2  
        )
        {
                ballSpeedX = Math.abs(ballSpeedX);
                let collidePoint = (ball.position.y - (playerPaddle.position.y + paddleHeight / 2)) / (paddleHeight / 2);
                ballSpeedY = speed3D * 1.5 * collidePoint;
                ball.position.x = playerPaddle.position.x + paddleWidth / 2 + ballSize;
        }
        if (ball.position.x + ballSize > aiPaddle.position.x - paddleWidth / 2 &&
            ball.position.y < aiPaddle.position.y + paddleHeight / 2 &&
            ball.position.y > aiPaddle.position.y - paddleHeight / 2
        )
        {
                ballSpeedX = -Math.abs(ballSpeedX);
                let collidePoint = (ball.position.y - (aiPaddle.position.y + paddleHeight / 2)) / (paddleHeight / 2);
                ballSpeedY = speed3D * 1.5 * collidePoint;
                ball.position.x = aiPaddle.position.x - paddleWidth / 2 - ballSize;
        }

		updatePlayerPosition();
		
        // Scoring
        if (ball.position.x - ballSize < -widthBoard) {
            aiScore++;
            resetBall();
        } else if (ball.position.x + ballSize > widthBoard) {
            playerScore++;
            resetBall();
        }

        // Move AI paddle
        //aiPaddle.position.y += (ball.position.y - aiPaddle.position.y) * 0.05;
        AIMovement()
        // Render scene
        renderer.render(scene, camera);

        if (is3DGameInitialized) {
            requestAnimationFrame(updateGame);
        }
    }

    function resetBall() {
        ball.position.set(0, 0, 0);
        ballSpeedX = -ballSpeedX;
        ballSpeedY = (Math.random() - 0.5) * 0.1;
    }
    
    function handleKeyDown(e) {
    	//if (!isGameOver && TisGameActive) {
        if (e.key === 'ArrowRight') {
            P1isUpPresse3D = true;
        } else if (e.key === 'ArrowLeft') {
            P1isDownPressed3D = true;
        	}
    	//}
 	}
 	
 		function handleKeyUp(e) {
    	//if (!isGameOver && TisGameActive) {
        if (e.key === 'ArrowRight') {
            P1isUpPresse3D = false;
        } else if (e.key === 'ArrowLeft') {
            P1isDownPressed3D = false;
        }
    //}
	}
 	
 	document.addEventListener('keydown', handleKeyDown);
 	document.addEventListener('keyup', handleKeyUp);
 	
 	function updatePlayerPosition() {
    if (P1isUpPresse3D && !P1isDownPressed3D) {
        playerPaddle.position.y -= speed3D;
    }
    if (P1isDownPressed3D && !P1isUpPresse3D) {
        playerPaddle.position.y += speed3D;
    }
    playerPaddle.position.y = Math.max( -5, playerPaddle.position.y);
    playerPaddle.position.y = Math.min( 5, playerPaddle.position.y);
}
    

    // Start game button
    document.getElementById('start3DGameBtn').addEventListener('click', () => {
        if (!is3DGameInitialized) {
            is3DGameInitialized = true;
            if (typeof onGameStart === 'function') {
                onGameStart();
            }
            requestAnimationFrame(updateGame);
        }
    });

    // Cleanup function
    function cleanup3DGame() {
        is3DGameInitialized = false;
        gameTab.innerHTML = '';
    }

    function AIMovement()
    {
        const currentTime = Date.now();
        const hBoard = heightBoard;
        const wBoard = widthBoard;
        if (currentTime - lastMoveTime >= 1000){

            aiReactionDelay = Math.random() * 200;
            aiPredictionError = (Math.random() - 0.5) * wBoard * 0.1;

            let timeToReach = (wBoard - paddleWidth - ball.position.x) / ballSpeedX;
            let predictedY = ball.position.y + (ballSpeedY * timeToReach) + aiPredictionError;
            targetY = predictedY - paddleHeight / 2 ; 

            targetY = aiPaddle.position.y + (targetY - aiPaddle.position.y) * aiAccuracy;

            //targetY = Math.max(0, Math.min(hBoard - paddleHeight, targetY));
            targetY = Math.max(-hBoard, Math.min(hBoard , targetY));
            // targetY = Math.max(-(hBoard / 2) + paddleHeight / 2, 
            //     Math.min((hBoard / 2) - paddleHeight / 2, targetY));

            lastMoveTime = currentTime;            
        }

        if (currentTime - lastMoveTime >= aiReactionDelay){
            if (Math.abs(aiPaddle.position.y - targetY) > aiMovementSpeed){
                aiPaddle.position.y += aiPaddle.position.y < targetY ? aiMovementSpeed : -aiMovementSpeed;
            } else {
                aiPaddle.position.y = targetY;
            }
        }

        //aiPaddle.position.y = Math.max(0, Math.min(hBoard - paddleWidth, aiPaddle.position.y));
        // aiPaddle.position.y = Math.max(-(hBoard/2) + paddleWidth / 2, 
        //     Math.min(hBoard / 2 - paddleWidth / 2, aiPaddle.position.y));
        
        
        aiPaddle.position.y = Math.max( (-hBoard / 2) + paddleWidth * 2, 
                            Math.min((hBoard / 2) - paddleWidth * 2, aiPaddle.position.y));
    }

    return cleanup3DGame;
}

// Global access to the 3D Pong game initialization
window.init3DPong = function(options = {}) {
    if (current3DGameInstance) {
        current3DGameInstance();
        current3DGameInstance = null;
    }
    current3DGameInstance = create3DPong(options);
};
