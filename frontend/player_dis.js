async function createGameD(options = {}) {
   	console.log("Emeraude");
    // Récupérer l'élément HTML où le contenu sera injecté
    const gameTab = document.getElementById('game_online');

    // Injecter le code HTML dans `gameTab`
    gameTab.innerHTML = `
        <div id="content">
            <button id="generateLinkBtn">Générer le lien de connexion bleu</button>
            <div id="linkContainer" style="display: none;">
                <p>Partagez ce lien avec quelqu'un sur le même réseau :</p>
                <input type="text" id="connectionLink" readonly>
            </div>
            <div id="statusMessage" style="display: none; color: green;">
                Vous êtes tous les deux connectés !
            </div>
        </div>
    `;

    const generateLinkBtn = document.getElementById('generateLinkBtn');
    const linkContainer = document.getElementById('linkContainer');
    const connectionLinkInput = document.getElementById('connectionLink');
    const statusMessage = document.getElementById('statusMessage');

    let ws; // Variable WebSocket

    generateLinkBtn.addEventListener('click', async () => {
        try {
            // Créer une nouvelle partie et obtenir un identifiant unique du serveur
            const response = await fetch('http://localhost:8000/api/game/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Impossible de créer une connexion.');
            }
console.log("Jaspe")
            const data = await response.json();
            const connectionId = data.connection_id;

            // Affiche le lien à partager
            const link = `http://${window.location.host}/join/${connectionId}`;
            //const link = `http://127.0.0.1:8000/join/${connectionId}`;
            connectionLinkInput.value = link;
            linkContainer.style.display = 'block';
console.log("Obscidienne")
            // Initialiser la connexion WebSocket
            ws = new WebSocket(`ws://${window.location.host}/ws/connection/${connectionId}/`);
            //ws = new WebSocket(`ws://127.0.0.1:8000/ws/connection/${connectionId}/`);


            ws.onopen = () => {
                console.log("Connexion WebSocket ouverte.");
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'confirmation') {
                    statusMessage.style.display = 'block';
                }
            };

            ws.onclose = () => {
                console.log("Connexion WebSocket fermée.");
            };

            ws.onerror = (error) => {
                console.error("Erreur WebSocket:", error);
            };
        } catch (error) {
            console.error('Erreur lors de la création de la connexion:', error);
            alert('Impossible de créer la connexion. Veuillez réessayer.');
        }
    });

    // Fonction pour rejoindre la connexion (appelée quand l'utilisateur clique sur le lien)
    async function joinConnection(connectionId) {
        ws = new WebSocket(`ws://${window.location.host}/ws/connection/${connectionId}/`);

        ws.onopen = () => {
            console.log("Connexion WebSocket ouverte pour rejoindre.");
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'confirmation') {
                statusMessage.style.display = 'block';
            }
        };

        ws.onclose = () => {
            console.log("Connexion WebSocket fermée.");
        };

        ws.onerror = (error) => {
            console.error("Erreur WebSocket:", error);
        };

        // Envoyer un message de connexion au serveur
        ws.send(JSON.stringify({ type: 'join', connection_id: connectionId }));
    }

    // Vérifier l'URL pour rejoindre la connexion si c'est un lien de jonction
    window.addEventListener('load', () => {
        const urlParts = window.location.pathname.split('/');
        if (urlParts[1] === 'join' && urlParts[2]) {
            const connectionId = urlParts[2];
            joinConnection(connectionId);
        }
    });
}
