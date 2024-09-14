function initFriends() {
    const friendsTab = document.getElementById('friends');
    friendsTab.innerHTML = `
        <h1 class="display-4">Friends</h1>
        <div id="friendList"></div>
        <div class="mt-4">
            <input type="text" id="friendUsername" placeholder="Friend's username">
            <button id="addFriendBtn" class="btn btn-primary">Add Friend</button>
        </div>
    `;

    loadFriends();
    document.getElementById('addFriendBtn').addEventListener('click', addFriend);
}

async function loadFriends() {
    try {
        const response = await fetch('http://localhost:8000/api/friends/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        if (response.ok) {
            const friends = await response.json();
            displayFriends(friends);
        } else {
            throw new Error('Failed to load friends');
        }
    } catch (error) {
        console.error('Error loading friends:', error);
    }
}

function displayFriends(friends) {
    const friendList = document.getElementById('friendList');
    friendList.innerHTML = friends.map(friend => `
        <div class="friend-item">
            ${friend.username}
            <button onclick="removeFriend(${friend.id}, '${friend.username}')" class="btn btn-sm btn-danger">Remove</button>
        </div>
    `).join('');
}

async function addFriend() {
    const username = document.getElementById('friendUsername').value;
    try {
        const response = await fetch('http://localhost:8000/api/friends/add/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.status);
            loadFriends();
        } else {
            throw new Error(data.error || 'Failed to add friend');
        }
    } catch (error) {
        console.error('Error adding friend:', error);
        alert(error.message);
    }
}

async function removeFriend(friendId, friendUsername) {
    try {
        console.log('Attempting to remove friend with ID:', friendId);
        const response = await fetch('http://localhost:8000/api/friends/remove/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ friend_id: friendId, username: friendUsername }),
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            alert('Friend removed successfully');
            loadFriends();
        } else {
            throw new Error(data.error || 'Failed to remove friend');
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        alert(error.message);
    }
}

window.initFriends = initFriends;