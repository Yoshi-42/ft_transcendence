function initHome() {
    const homeTab = document.getElementById('home');
    homeTab.innerHTML = `
         <script> 

   		</script>        
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
                <button id="tournament" class="btn btn-info">Tournament Info</button>
            </div>
        </div>
       
    `;
  
  	document.getElementById('tournament').addEventListener('click', async () => {
        if (typeof initTournament === 'function') {
        	showTab('tournament');
        } else {
            console.error("initTournament function is not defined");
        }
    });
}


