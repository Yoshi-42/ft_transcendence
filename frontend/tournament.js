function initForestAnimals() {
    const forestTab = document.getElementById('forest');
    forestTab.innerHTML = `
        <h1 class="display-4">Welcome to the Enchanted Forest</h1>
        <p class="lead">Discover the majestic creatures that inhabit the forest.</p>
        <hr class="my-4">
        <p>Explore the wonders of nature and learn about the diverse wildlife that call the forest their home.</p>
        <div class="row mt-4">
            <div class="col-md-4">
                <h3>Animal Spotlight</h3>
                <p>Learn about the unique characteristics of different forest animals.</p>
                <button class="btn btn-primary">Discover Now</button>
            </div>
            <div class="col-md-4">
                <h3>Conservation Efforts</h3>
                <p>Find out how you can help protect these incredible species.</p>
                <button class="btn btn-secondary">Get Involved</button>
            </div>
            <div class="col-md-4">
                <h3>Wildlife Tours</h3>
                <p>Join a guided tour and experience the forest up close.</p>
                <button class="btn btn-info">Book a Tour</button>
            </div>
        </div>
    `;
}
