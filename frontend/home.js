function initHome() {
    const homeTab = document.getElementById('home');
    homeTab.innerHTML = `       
        <h1 class="display-4">Welcomes to Transcendence</h1>
        <p class="lead">This is the home page of our exciting Pong game platform.</p>
        <hr class="my-4">
        <p>Get ready for an unparalleled Pong experience! Challenge your friends, improve your skills, and climb the leaderboards.</p>
        <div class="row mt-4">
            <div class="col-md-4">
                <h3>Quick Start</h3>
                <p>Jump right into a game or explore our features.</p>
                <button class="btn btn-primary">Play Now</button>
            </div>
            <div class="col-md-4">
                <h3>Leaderboard</h3>
                <p>Check out the top players and see where you rank.</p>
                <button class="btn btn-secondary">View Leaderboard</button>
            </div>
            <div class="col-md-4">
                <h3>Tournament</h3>
                <p>Join our weekly tournaments for exciting prizes!</p>
                <button id="tournament_btn" class="btn btn-info">Tournament Info</button>
            </div>
            <div class="mt-4">
            <h3>Explore in 3D</h3>
            <button id="explore_3d" class="btn btn-success">View 3D Scene</button>
        	</div>
            <div class="mt-4">
            <h3>Test bouton</h3>
            <button id="test" class="btn btn-success">Test Button</button>
        	</div>
        </div>
       
    `;
  
  
	document.getElementById('explore_3d').addEventListener('click', () => {
        if (typeof create3DPong === 'function') {
        	showTab('3d_pong');
        } else {
            console.error("initTournament function is not defined");
        }
        //initThreeJS();
    });
    
    // document.getElementsById('test').addEventListener('click',  () => {
    //     if (typeof initTest === 'function'){
    //         showTab('test')
    //     } else {
    //         console.error("initTest function is not defined");
    //     }
    // });
    
  	document.getElementById('tournament_btn').addEventListener('click', async () => {
        if (typeof initTournament === 'function') {
        	showTab('tournament');
        } else {
            console.error("initTournament function is not defined");
        }
    });
}


