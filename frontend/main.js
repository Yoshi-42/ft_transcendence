// main.js

(function() {
    const tabHistory = [];
    let currentTabIndex = -1;

    function showTab(tabId, pushState = true) {
        if (!Auth.isAuthenticated()) {
            Auth.showAuthModal();
            return;
        }

        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => tab.style.display = 'none');

        // Show the selected tab content
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Update active state in navigation
        const navButtons = document.querySelectorAll('.nav-link');
        navButtons.forEach(button => button.classList.remove('active'));
        const activeButton = document.getElementById(`${tabId}Btn`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Call the init function for the selected tab
        if (tabId === 'home' && typeof initHome === 'function') initHome();
        else if (tabId === 'game' && typeof initGame === 'function') initGame();
        else if (tabId === 'user' && typeof initUser === 'function') initUser();

        if (pushState) {
            // Update the URL and add to history
            history.pushState({ tabId: tabId }, '', `#${tabId}`);
            tabHistory.push(tabId);
            currentTabIndex = tabHistory.length - 1;
        }
    }

    function handlePopState(event) {
        if (event.state && event.state.tabId) {
            showTab(event.state.tabId, false);
        } else {
            // Default to home if no state is available
            showTab('home', false);
        }
    }

    function initApp() {
        // Initialize authentication
        Auth.init();

        if (!Auth.isAuthenticated()) {
            Auth.showAuthModal();
        } else {
            // Show initial tab
            const initialTab = location.hash.replace('#', '') || 'home';
            showTab(initialTab, false);
        }

        const navButtons = document.querySelectorAll('.nav-link');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.target.id.replace('Btn', '');
                showTab(tabId);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', handlePopState);

        // Handle sign out
        document.getElementById('signOutBtn').addEventListener('click', () => {
            Auth.signOut();
            // The redirect is now handled in the Auth.signOut() function
        });
    }

    // Make showTab available globally
    window.showTab = showTab;

    // Initialize the app when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initApp);
})();