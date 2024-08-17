function initGame() {
    const gameTab = document.getElementById('game');
    gameTab.innerHTML = `
        <h1 class="display-4">Pong Game</h1>
        <p class="lead">Challenge yourself or play against others in our classic Pong game.</p>
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Single Player</h5>
                        <p class="card-text">Play against our AI and improve your skills.</p>
                        <button onclick="startGame('single')" class="btn btn-primary">Start Single Player Game</button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Multiplayer</h5>
                        <p class="card-text">Challenge your friends or random opponents.</p>
                        <button onclick="startGame('multi')" class="btn btn-success">Start Multiplayer Game</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="gameArea" class="mt-4"></div>
    `;
}

function startGame(mode) {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="alert alert-info">
            Starting a new ${mode === 'single' ? 'Single Player' : 'Multiplayer'} Pong game...
        </div>
        <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
        </div>
    `;
    // Here you would typically initialize your Pong game
    console.log(`Starting a new ${mode} Pong game...`);
}