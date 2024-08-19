// tournament.js

function initTournament() {
    const tournamentTab = document.getElementById('home');
    tournamentTab.innerHTML = `
        <h1 class="display-4">Tournament Page</h1>
        <p class="lead">Join our exciting tournaments and win amazing prizes!</p>
        <hr class="my-4">
        <p>Check out the upcoming tournaments or view the results of past ones.</p>
        <button class="btn btn-success">Join Tournament</button>
    `;
    console.log("Tournament initialized!");
}
