(function() {
    function showTab(tabId) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => tab.classList.remove('active'));

        // Show the selected tab content
        const selectedTab = document.getElementById(tabId);
        selectedTab.classList.add('active');

        // Update active state in navigation
        const navButtons = document.querySelectorAll('.nav-link');
        navButtons.forEach(button => button.classList.remove('active'));
        document.getElementById(`${tabId}Btn`).classList.add('active');

        // Call the init function for the selected tab
        if (tabId === 'home') initHome();
        else if (tabId === 'game') initGame();
        else if (tabId === 'user') initUser();

        // Update the URL without reloading the page
        history.pushState(null, '', `#${tabId}`);
    }

    function initApp() {
        const navButtons = document.querySelectorAll('.nav-link');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.target.id.replace('Btn', '');
                showTab(tabId);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const tabId = location.hash.replace('#', '') || 'home';
            showTab(tabId);
        });

        // Initial load
        const initialTab = location.hash.replace('#', '') || 'home';
        showTab(initialTab);
    }

    // Make showTab available globally
    window.showTab = showTab;

    // Initialize the app when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initApp);
})();