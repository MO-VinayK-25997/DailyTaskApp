// Team Management Module
window.teamMembers = window.teamMembers || [];
window.projects = window.projects || [];
let teamMembers = window.teamMembers;
let projects = window.projects;

function getUserTeamMembers() {
    return teamMembers.filter(member => member.userId === currentUser.id);
}

function getUserProjects() {
    return projects.filter(project => project.userId === currentUser.id);
}

function populateUserSelect() {
    const memberUserSelect = document.getElementById('memberUserSelect');
    if (!memberUserSelect) return;
    
    memberUserSelect.innerHTML = '<option value="">Select a registered user</option>';
    
    // Filter out current user and already added team members
    const existingMemberIds = getUserTeamMembers().map(m => m.selectedUserId);
    const availableUsers = users.filter(u => 
        u.id !== currentUser.id && !existingMemberIds.includes(u.id)
    );
    
    availableUsers.forEach(user => {
        memberUserSelect.innerHTML += `<option value="${user.id}">${user.username} (${user.email})</option>`;
    });
}

function renderTeamMembers() {
    const teamList = document.getElementById('teamList');
    if (!teamList) return;
    
    teamList.innerHTML = '';
    const userTeamMembers = getUserTeamMembers();
    
    userTeamMembers.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role} - ${member.email}</div>
                <div style="font-size: 0.8rem; color: #999;">Added: ${member.joinDate}</div>
            </div>
            <div class="member-actions">
                <button class="delete-btn" onclick="deleteMember(${member.id})">✕</button>
            </div>
        `;
        teamList.appendChild(memberItem);
    });
}

function deleteMember(id) {
    teamMembers = teamMembers.filter(m => m.id !== id || m.userId !== currentUser.id);
    saveTeamMembers();
    renderTeamMembers();
    updateStats();
}

function saveTeamMembers() {
    window.teamMembers = teamMembers;
    db.saveTeamMembers(teamMembers);
}

// Project functions
function renderProjects() {
    const projectList = document.getElementById('projectList');
    if (!projectList) return;
    
    projectList.innerHTML = '';
    const userProjects = getUserProjects();
    
    userProjects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${project.name}</strong>
                    <div style="font-size: 0.9rem; color: #666;">${project.status}</div>
                </div>
                <button class="delete-btn" onclick="deleteProject(${project.id})">✕</button>
            </div>
        `;
        projectList.appendChild(projectItem);
    });
}

function deleteProject(id) {
    projects = projects.filter(p => p.id !== id || p.userId !== currentUser.id);
    saveProjects();
    renderProjects();
    updateStats();
}

function saveProjects() {
    window.projects = projects;
    db.saveProjects(projects);
}