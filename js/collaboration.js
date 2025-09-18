// Collaboration Module
let collaborationRequests = window.collaborationRequests || [];
let activeCollaborations = window.activeCollaborations || [];

// Collaboration functions
function sendCollaborationRequest(email) {
    const targetUser = users.find(u => u.email === email && u.role !== 'admin');
    
    if (!targetUser) {
        showNotification('User not found or cannot collaborate with admin');
        return;
    }
    
    if (targetUser.id === currentUser.id) {
        showNotification('Cannot collaborate with yourself');
        return;
    }
    
    const existingRequest = collaborationRequests.find(r => 
        (r.fromUserId === currentUser.id && r.toUserId === targetUser.id) ||
        (r.fromUserId === targetUser.id && r.toUserId === currentUser.id)
    );
    
    if (existingRequest) {
        showNotification('Request already exists');
        return;
    }
    
    const existingCollab = activeCollaborations.find(c => 
        (c.user1Id === currentUser.id && c.user2Id === targetUser.id) ||
        (c.user1Id === targetUser.id && c.user2Id === currentUser.id)
    );
    
    if (existingCollab) {
        showNotification('Already collaborating');
        return;
    }
    
    collaborationRequests.push({
        id: Date.now(),
        fromUserId: currentUser.id,
        fromUserName: currentUser.username,
        fromUserEmail: currentUser.email,
        toUserId: targetUser.id,
        toUserName: targetUser.username,
        toUserEmail: targetUser.email,
        status: 'pending',
        createdDate: new Date().toLocaleDateString()
    });
    
    saveCollaborationRequests();
    renderCollaborationRequests();
    showNotification('Collaboration request sent!');
}

function acceptCollaborationRequest(requestId) {
    const request = collaborationRequests.find(r => r.id === requestId);
    if (!request) return;
    
    activeCollaborations.push({
        id: Date.now(),
        user1Id: request.fromUserId,
        user1Name: request.fromUserName,
        user1Email: request.fromUserEmail,
        user2Id: request.toUserId,
        user2Name: request.toUserName,
        user2Email: request.toUserEmail,
        createdDate: new Date().toLocaleDateString()
    });
    
    collaborationRequests = collaborationRequests.filter(r => r.id !== requestId);
    
    saveCollaborationRequests();
    saveActiveCollaborations();
    renderCollaborationRequests();
    renderActiveCollaborations();
    renderTodos();
    showNotification('Collaboration accepted!');
}

function rejectCollaborationRequest(requestId) {
    collaborationRequests = collaborationRequests.filter(r => r.id !== requestId);
    saveCollaborationRequests();
    renderCollaborationRequests();
    showNotification('Request rejected');
}

function endCollaboration(collabId) {
    activeCollaborations = activeCollaborations.filter(c => c.id !== collabId);
    saveActiveCollaborations();
    renderActiveCollaborations();
    renderTodos();
    showNotification('Collaboration ended');
}

function renderCollaborationRequests() {
    const requestsContainer = document.getElementById('collabRequests');
    if (!requestsContainer) return;
    
    const myRequests = collaborationRequests.filter(r => r.toUserId === currentUser.id);
    
    if (myRequests.length === 0) {
        requestsContainer.innerHTML = '';
        return;
    }
    
    requestsContainer.innerHTML = '<h4>Collaboration Requests</h4>';
    
    myRequests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'collab-request';
        requestItem.innerHTML = `
            <div>
                <strong>${request.fromUserName}</strong> wants to collaborate
                <div style="font-size: 0.9rem; color: #666;">${request.fromUserEmail}</div>
            </div>
            <div class="collab-actions">
                <button class="accept-btn" onclick="acceptCollaborationRequest(${request.id})">Accept</button>
                <button class="reject-btn" onclick="rejectCollaborationRequest(${request.id})">Reject</button>
            </div>
        `;
        requestsContainer.appendChild(requestItem);
    });
}

function renderActiveCollaborations() {
    const collabContainer = document.getElementById('activeCollabs');
    if (!collabContainer) return;
    
    const myCollabs = activeCollaborations.filter(c => 
        c.user1Id === currentUser.id || c.user2Id === currentUser.id
    );
    
    if (myCollabs.length === 0) {
        collabContainer.innerHTML = '';
        return;
    }
    
    collabContainer.innerHTML = '<h4>Active Collaborations</h4>';
    
    myCollabs.forEach(collab => {
        const partnerName = collab.user1Id === currentUser.id ? collab.user2Name : collab.user1Name;
        const partnerEmail = collab.user1Id === currentUser.id ? collab.user2Email : collab.user1Email;
        
        const collabItem = document.createElement('div');
        collabItem.className = 'collab-item';
        collabItem.innerHTML = `
            <div>
                <strong>Collaborating with ${partnerName}</strong>
                <div style="font-size: 0.9rem; color: #666;">${partnerEmail}</div>
            </div>
            <button class="reject-btn" onclick="endCollaboration(${collab.id})">End</button>
        `;
        collabContainer.appendChild(collabItem);
    });
}

function saveCollaborationRequests() {
    window.collaborationRequests = collaborationRequests;
    db.saveCollaborationRequests(collaborationRequests);
}

function saveActiveCollaborations() {
    window.activeCollaborations = activeCollaborations;
    db.saveActiveCollaborations(activeCollaborations);
}