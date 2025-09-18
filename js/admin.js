// Admin Panel Module
// Initialize and refresh global variables
async function refreshAdminData() {
    window.users = await db.getUsers();
    window.todos = await db.getTodos();
    window.teamMembers = await db.getTeamMembers();
    window.projects = await db.getProjects();
    window.activeCollaborations = await db.getActiveCollaborations();
    
    users = window.users;
    todos = window.todos;
    teamMembers = window.teamMembers;
    projects = window.projects;
    activeCollaborations = window.activeCollaborations;
}

// Admin functions
async function loadAdminData() {
    if (currentUser && currentUser.role === 'admin') {
        await refreshAdminData();
        
        const totalUsersEl = document.getElementById('totalUsers');
        const totalTodosEl = document.getElementById('totalTodos');
        
        if (totalUsersEl) totalUsersEl.textContent = users.length;
        if (totalTodosEl) totalTodosEl.textContent = todos.length;
        
        const userList = document.getElementById('userList');
        if (userList) {
            userList.innerHTML = '';
            
            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <div class="user-info">
                        <div class="user-name">${user.username}</div>
                        <div class="user-role">${user.role} - ${user.email}</div>
                    </div>
                    <div class="user-actions">
                        ${user.id !== currentUser.id ? `<button class="delete-btn" onclick="deleteUser(${user.id})">✕</button>` : '<span style="color: #999;">Current Admin</span>'}
                    </div>
                `;
                userList.appendChild(userItem);
            });
        }
        
        // Populate user select dropdowns
        populateAdminUserSelects();
        loadAdminCollaborations();
        loadAdminProjects();
        
        // Load all users todos immediately
        viewAllUsersTodos();
    }
}

async function populateAdminUserSelects() {
    await refreshAdminData();
    
    const userSelect = document.getElementById('adminUserSelect');
    const multiSelect = document.getElementById('adminUserMultiSelect');
    
    if (userSelect) {
        userSelect.innerHTML = '<option value="">Select user to view data</option>';
        users.forEach(user => {
            userSelect.innerHTML += `<option value="${user.id}">${user.username} (${user.email})</option>`;
        });
    }
    
    if (multiSelect) {
        multiSelect.innerHTML = '';
        users.forEach(user => {
            multiSelect.innerHTML += `<option value="${user.id}">${user.username} (${user.email})</option>`;
        });
    }
}

window.viewUserData = async function() {
    const userId = parseInt(document.getElementById('adminUserSelect').value);
    if (!userId) return;
    
    await refreshAdminData();
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const userTodos = todos.filter(t => t.userId === userId);
    const userTeamMembers = teamMembers.filter(m => m.userId === userId);
    const userProjects = projects.filter(p => p.userId === userId);
    
    const dataDisplay = document.getElementById('userDataDisplay');
    dataDisplay.innerHTML = `
        <h4>${user.username}'s Data</h4>
        
        <div class="user-data-section">
            <h5>Todos (${userTodos.length})</h5>
            ${userTodos.map(todo => 
                `<div class="data-item">${todo.text} - ${todo.completed ? 'Completed' : 'Pending'}</div>`
            ).join('')}
        </div>
        
        <div class="user-data-section">
            <h5>Team Members (${userTeamMembers.length})</h5>
            ${userTeamMembers.map(member => 
                `<div class="data-item">${member.name} - ${member.role}</div>`
            ).join('')}
        </div>
        
        <div class="user-data-section">
            <h5>Projects (${userProjects.length})</h5>
            ${userProjects.map(project => 
                `<div class="data-item">${project.name} - ${project.status}</div>`
            ).join('')}
        </div>
    `;
}

window.adminCreateMultipleCollaborations = async function() {
    const multiSelect = document.getElementById('adminUserMultiSelect');
    const selectedOptions = Array.from(multiSelect.selectedOptions);
    const selectedUserIds = selectedOptions.map(option => parseInt(option.value));
    
    if (selectedUserIds.length < 2) {
        showNotification('Please select at least 2 users');
        return;
    }
    
    await refreshAdminData();
    let createdCount = 0;
    
    // Create collaborations between all selected users
    for (let i = 0; i < selectedUserIds.length; i++) {
        for (let j = i + 1; j < selectedUserIds.length; j++) {
            const user1Id = selectedUserIds[i];
            const user2Id = selectedUserIds[j];
            
            const existingCollab = activeCollaborations.find(c => 
                (c.user1Id === user1Id && c.user2Id === user2Id) ||
                (c.user1Id === user2Id && c.user2Id === user1Id)
            );
            
            if (!existingCollab) {
                const user1 = users.find(u => u.id === user1Id);
                const user2 = users.find(u => u.id === user2Id);
                
                activeCollaborations.push({
                    id: Date.now() + createdCount,
                    user1Id: user1Id,
                    user1Name: user1.username,
                    user1Email: user1.email,
                    user2Id: user2Id,
                    user2Name: user2.username,
                    user2Email: user2.email,
                    createdDate: new Date().toLocaleDateString(),
                    createdBy: 'admin'
                });
                createdCount++;
            }
        }
    }
    
    saveActiveCollaborations();
    loadAdminCollaborations();
    multiSelect.selectedIndex = -1;
    showNotification(`${createdCount} collaborations created successfully!`);
}

function loadAdminCollaborations() {
    const collabList = document.getElementById('adminCollabList');
    if (!collabList) return;
    
    if (activeCollaborations.length === 0) {
        collabList.innerHTML = '<p>No active collaborations</p>';
        return;
    }
    
    collabList.innerHTML = '<h4>Active Collaborations</h4>';
    
    activeCollaborations.forEach(collab => {
        const collabItem = document.createElement('div');
        collabItem.className = 'admin-collab-item';
        collabItem.innerHTML = `
            <div>
                <div class="collab-users">${collab.user1Name} ↔ ${collab.user2Name}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    ${collab.user1Email} & ${collab.user2Email}
                </div>
                <div style="font-size: 0.8rem; color: #999;">
                    Created: ${collab.createdDate} ${collab.createdBy ? '(by admin)' : ''}
                </div>
            </div>
            <button class="reject-btn" onclick="adminEndCollaboration(${collab.id})">End</button>
        `;
        collabList.appendChild(collabItem);
    });
}

window.adminEndCollaboration = async function(collabId) {
    await refreshAdminData();
    activeCollaborations = activeCollaborations.filter(c => c.id !== collabId);
    saveActiveCollaborations();
    loadAdminCollaborations();
    showNotification('Collaboration ended by admin');
}

window.viewAllUsersTodos = async function() {
    const allTodosContainer = document.getElementById('allUsersTodos');
    if (!allTodosContainer) {
        return;
    }
    
    await refreshAdminData();
    
    allTodosContainer.innerHTML = '';
    
    users.forEach(user => {
        const userTodos = todos.filter(t => t.userId === user.id);
        
        const userSection = document.createElement('div');
        userSection.className = 'user-todos-section';
        
        const completedCount = userTodos.filter(t => t.completed).length;
        const totalCount = userTodos.length;
        
        userSection.innerHTML = `
            <div class="user-todos-header">
                <div>
                    <strong>${user.username}</strong> (${user.email})
                    <div style="font-size: 0.9rem; opacity: 0.9;">${user.role}</div>
                </div>
                <div style="text-align: right;">
                    <div>${completedCount}/${totalCount} completed</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">Joined: ${user.joinDate}</div>
                </div>
            </div>
            <div class="user-todos-list" id="userTodos_${user.id}"></div>
        `;
        
        allTodosContainer.appendChild(userSection);
        
        const todosList = document.getElementById(`userTodos_${user.id}`);
        
        if (userTodos.length === 0) {
            todosList.innerHTML = '<div class="no-todos">No todos created yet</div>';
        } else {
            userTodos.forEach(todo => {
                const todoItem = document.createElement('div');
                todoItem.className = `admin-todo-item ${todo.completed ? 'completed' : ''}`;
                todoItem.innerHTML = `
                    <div class="admin-todo-text ${todo.completed ? 'completed' : ''}">
                        ${todo.text}
                        <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.25rem;">
                            Created: ${todo.date}
                        </div>
                    </div>
                    <div class="admin-todo-status ${todo.completed ? 'completed' : 'pending'}">
                        ${todo.completed ? '✓ Done' : '⏳ Pending'}
                    </div>
                `;
                todosList.appendChild(todoItem);
            });
        }
    });
    
    if (users.length === 0) {
        allTodosContainer.innerHTML = '<div class="no-todos">No registered users found</div>';
    } else {
        console.log('Displayed todos for', users.length, 'users');
    }
}

window.deleteUser = async function(userId) {
    if (currentUser && currentUser.role === 'admin' && userId !== currentUser.id) {
        if (confirm('Are you sure you want to delete this user?')) {
            await refreshAdminData();
            users = users.filter(u => u.id !== userId);
            window.users = users;
            await db.saveUsers(users);
            loadAdminData();
            showNotification('User deleted');
        }
    } else if (userId === currentUser.id) {
        showNotification('Cannot delete yourself');
    }
}

window.clearAllData = async function() {
    if (currentUser && currentUser.role === 'admin') {
        if (confirm('Are you sure you want to clear all data?')) {
            await db.saveTodos([]);
            await db.saveTeamMembers([]);
            await db.saveProjects([]);
            await db.saveActiveCollaborations([]);
            await refreshAdminData();
            loadAdminData();
            showNotification('All data cleared');
        }
    }
}

function loadAdminProjects() {
    const adminProjectList = document.getElementById('adminProjectList');
    if (!adminProjectList) return;
    
    adminProjectList.innerHTML = '';
    
    if (projects.length === 0) {
        adminProjectList.innerHTML = '<p>No projects created yet</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'admin-collab-item';
        projectItem.innerHTML = `
            <div>
                <div class="collab-users">${project.name}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    Status: ${project.status}
                </div>
                <div style="font-size: 0.8rem; color: #999;">
                    Created: ${project.createdDate}
                </div>
            </div>
            <button class="reject-btn" onclick="deleteAdminProject(${project.id})">Delete</button>
        `;
        adminProjectList.appendChild(projectItem);
    });
}

window.deleteAdminProject = async function(projectId) {
    if (currentUser && currentUser.role === 'admin') {
        await refreshAdminData();
        projects = projects.filter(p => p.id !== projectId);
        window.projects = projects;
        await db.saveProjects(projects);
        loadAdminProjects();
        showNotification('Project deleted');
    }
}

window.exportData = function() {
    if (currentUser && currentUser.role === 'admin') {
        const data = {
            users: users,
            todos: todos,
            teamMembers: teamMembers,
            projects: projects
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'app-data.json';
        link.click();
        
        showNotification('Data exported');
    }
}