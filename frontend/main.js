// main.js

(function() {
    const tabHistory = [];
    let currentTabIndex = -1;

    function showTab(tabId, pushState = true) {
        if (!Auth.isAuthenticated()) {
            Auth.showAuthModal();
            return;
        }

        // Clean up the game if we're navigating away from the game tab
        if (tabId !== 'game' && currentGameInstance) {
            if (typeof currentGameInstance === 'function') {
                currentGameInstance();
            } else if (currentGameInstance instanceof Promise) {
                currentGameInstance.then(cleanup => {
                    if (typeof cleanup === 'function') {
                        cleanup();
                    }
                }).catch(error => console.error("Error cleaning up game:", error));
            }
            currentGameInstance = null;
            console.log("Current instance of the game has been cleaned up");
        }
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => tab.style.display = 'none');

        // Show the selected tab content
        console.log("Emeraude : ", tabId);
        const selectedTab = document.getElementById(tabId);
        console.log("Jaspe 1: " , selectedTab);
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
		else if (tabId === 'tournament' && typeof initTournament === 'function') initTournament();
		else if (tabId === '3d_pong' && typeof create3DPong === 'function') create3DPong();
        // else if (tabId === 'test' && typeof initTest === 'function') initTest();
        
        if (pushState) {
            // Update the URL and add to history
            history.pushState({ tabId: tabId }, '', `#${tabId}`);
            tabHistory.push(tabId);
            currentTabIndex = tabHistory.length - 1;
        }
        console.log("Jaspe 2: " , selectedTab);
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
