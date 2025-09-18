// Todo Management Module
window.todos = [];
let todos = window.todos;

// Project selection population
function populateProjectSelect(selectId = 'todoProject') {
    const projectSelect = document.getElementById(selectId);
    if (!projectSelect) return;
    
    projectSelect.innerHTML = '<option value="">Select a project</option>';
    
    if (projects.length === 0) {
        projectSelect.innerHTML = '<option value="">No projects available - Contact admin</option>';
        return;
    }
    
    projects.forEach(project => {
        projectSelect.innerHTML += `<option value="${project.id}">${project.name}</option>`;
    });
}

function getProjectName(projectId) {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
}

// Filter data by current user
function getUserTodos() {
    return todos.filter(todo => todo.userId === currentUser.id);
}

function getSharedTodos() {
    const myCollabs = activeCollaborations.filter(c => 
        c.user1Id === currentUser.id || c.user2Id === currentUser.id
    );
    
    const partnerIds = myCollabs.map(c => 
        c.user1Id === currentUser.id ? c.user2Id : c.user1Id
    );
    
    return todos.filter(todo => {
        const todoUser = users.find(u => u.id === todo.userId);
        return partnerIds.includes(todo.userId) && todoUser && todoUser.role !== 'admin';
    });
}



// Todo functions
function renderProjects() {
    const projectList = document.getElementById('projectList');
    if (!projectList) return;
    
    projectList.innerHTML = '';
    
    if (projects.length === 0) {
        projectList.innerHTML = '<p>No projects available</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div class="project-name">${project.name}</div>
            <div class="project-status">Status: ${project.status}</div>
            <div class="project-date">Created: ${project.createdDate}</div>
        `;
        projectList.appendChild(projectItem);
    });
}

function getWeekRange(weekType) {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay;
    
    let startDate, endDate;
    
    switch(weekType) {
        case 'this-week':
            startDate = new Date(now.setDate(diff));
            endDate = new Date(now.setDate(diff + 6));
            break;
        case 'last-week':
            startDate = new Date(now.setDate(diff - 7));
            endDate = new Date(now.setDate(diff - 1));
            break;
        case 'next-week':
            startDate = new Date(now.setDate(diff + 7));
            endDate = new Date(now.setDate(diff + 13));
            break;
        default:
            return null;
    }
    
    return { startDate, endDate };
}

function filterTodos(todos, weekFilter, statusFilter) {
    let filtered = [...todos];
    
    // Week filter
    if (weekFilter !== 'all') {
        const weekRange = getWeekRange(weekFilter);
        if (weekRange) {
            filtered = filtered.filter(todo => {
                const todoDate = new Date(todo.date);
                return todoDate >= weekRange.startDate && todoDate <= weekRange.endDate;
            });
        }
    }
    
    // Status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(todo => (todo.status || 'pending') === statusFilter);
    }
    
    return filtered;
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    if (!todoList) return;
    
    const weekFilter = document.getElementById('weekFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const typeFilter = document.getElementById('typeFilter')?.value || 'all';
    
    todoList.innerHTML = '';
    const userTodos = getUserTodos();
    const sharedTodos = getSharedTodos();
    
    const filteredUserTodos = filterTodos(userTodos, weekFilter, statusFilter);
    const filteredSharedTodos = filterTodos(sharedTodos, weekFilter, statusFilter);
    
    // Render user's own todos
    if (typeFilter === 'all' || typeFilter === 'my') {
        filteredUserTodos.forEach(todo => {
        const projectName = getProjectName(todo.projectId);
        const status = todo.status || 'pending';
        const statusLabel = getStatusLabel(status);
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${status}`;
        todoItem.innerHTML = `
            <div class="todo-text">
                ${todo.text}
                <div style="font-size: 0.8rem; color: #007bff; margin-top: 0.25rem;">
                    Project: ${projectName} | Status: ${statusLabel}
                </div>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" onclick="editTodo(${todo.id})">✏️</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">✕</button>
            </div>
        `;
            todoList.appendChild(todoItem);
        });
    }
    
    // Render shared todos if any
    if ((typeFilter === 'all' || typeFilter === 'team') && filteredSharedTodos.length > 0) {
        const sharedSection = document.createElement('div');
        sharedSection.className = 'shared-todos';
        sharedSection.innerHTML = '<h4>Team Member Tasks</h4>';
        
        filteredSharedTodos.forEach(todo => {
            const partnerName = getPartnerName(todo.userId);
            const projectName = getProjectName(todo.projectId);
            const status = todo.status || 'pending';
            const statusLabel = getStatusLabel(status);
            const todoCard = document.createElement('div');
            todoCard.className = `card team-todo-card ${status}`;
            todoCard.innerHTML = `
                <div class="team-member-header">
                    <span class="member-badge">${partnerName}</span>
                    <span class="status-badge ${status}">
                        ${statusLabel}
                    </span>
                </div>
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-date">Project: ${projectName} | Created: ${todo.date}</div>
                </div>
            `;
            sharedSection.appendChild(todoCard);
        });
        
        todoList.appendChild(sharedSection);
    }
}

function getPartnerName(userId) {
    const user = users.find(u => u.id === userId);
    return user && user.role !== 'admin' ? user.username : 'Unknown';
}

function getStatusLabel(status) {
    const statusMap = {
        'to-be-started': 'To be started',
        'pending': 'Pending',
        'in-progress': 'In progress',
        'hold': 'Hold',
        'completed': 'Completed',
        'rejected': 'Rejected'
    };
    return statusMap[status] || 'Pending';
}

let editingTodoId = null;

window.editTodo = function(id) {
    const todo = todos.find(t => t.id === id && t.userId === currentUser.id);
    if (!todo) return;
    
    editingTodoId = id;
    populateProjectSelect('editTodoProject');
    
    document.getElementById('editTodoText').value = todo.text;
    document.getElementById('editTodoProject').value = todo.projectId;
    document.getElementById('editTodoStatus').value = todo.status || 'pending';
    document.getElementById('editTodoInput').style.display = 'block';
    document.getElementById('todoInput').style.display = 'none';
}

// Edit todo event listeners
document.addEventListener('DOMContentLoaded', function() {
    const saveEditTodo = document.getElementById('saveEditTodo');
    const cancelEditTodo = document.getElementById('cancelEditTodo');
    
    saveEditTodo?.addEventListener('click', () => {
        const text = document.getElementById('editTodoText').value.trim();
        const projectId = document.getElementById('editTodoProject').value;
        const status = document.getElementById('editTodoStatus').value;
        
        if (!projectId) {
            showNotification('Please select a project');
            return;
        }
        
        if (text && editingTodoId) {
            const todo = todos.find(t => t.id === editingTodoId);
            if (todo && todo.userId === currentUser.id) {
                todo.text = text;
                todo.projectId = parseInt(projectId);
                todo.status = status;
                saveTodos();
                renderTodos();
                document.getElementById('editTodoInput').style.display = 'none';
                editingTodoId = null;
                updateStats();
                showNotification('Todo updated successfully');
            }
        }
    });
    
    cancelEditTodo?.addEventListener('click', () => {
        document.getElementById('editTodoInput').style.display = 'none';
        editingTodoId = null;
    });
    
    // Filter event listeners
    const weekFilter = document.getElementById('weekFilter');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    weekFilter?.addEventListener('change', renderTodos);
    statusFilter?.addEventListener('change', renderTodos);
    typeFilter?.addEventListener('change', renderTodos);
    
    // Report filter event listeners
    const reportWeekFilter = document.getElementById('reportWeekFilter');
    const reportTypeFilter = document.getElementById('reportTypeFilter');
    
    reportWeekFilter?.addEventListener('change', generateReport);
    reportTypeFilter?.addEventListener('change', generateReport);
});

// Setup todo event listeners function
window.setupTodoEventListeners = function() {
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoText = document.getElementById('todoText');
    const saveTodo = document.getElementById('saveTodo');
    const cancelTodo = document.getElementById('cancelTodo');
    const saveEditTodo = document.getElementById('saveEditTodo');
    const cancelEditTodo = document.getElementById('cancelEditTodo');
    const weekFilter = document.getElementById('weekFilter');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    addTodoBtn?.addEventListener('click', () => {
        populateProjectSelect();
        document.getElementById('todoInput').style.display = 'block';
        document.getElementById('todoProject')?.focus();
    });
    
    saveTodo?.addEventListener('click', () => {
        const text = todoText.value.trim();
        const projectId = document.getElementById('todoProject')?.value;
        
        if (!projectId) {
            showNotification('Please select a project first');
            return;
        }
        
        if (text) {
            todos.push({
                id: Date.now(),
                text: text,
                status: 'to-be-started',
                date: new Date().toLocaleDateString(),
                userId: currentUser.id,
                projectId: parseInt(projectId)
            });
            saveTodos();
            renderTodos();
            todoText.value = '';
            document.getElementById('todoProject').value = '';
            document.getElementById('todoInput').style.display = 'none';
            updateStats();
        }
    });
    
    cancelTodo?.addEventListener('click', () => {
        todoText.value = '';
        document.getElementById('todoInput').style.display = 'none';
    });
    
    saveEditTodo?.addEventListener('click', () => {
        const text = document.getElementById('editTodoText').value.trim();
        const projectId = document.getElementById('editTodoProject').value;
        const status = document.getElementById('editTodoStatus').value;
        
        if (!projectId) {
            showNotification('Please select a project');
            return;
        }
        
        if (text && editingTodoId) {
            const todo = todos.find(t => t.id === editingTodoId);
            if (todo && todo.userId === currentUser.id) {
                todo.text = text;
                todo.projectId = parseInt(projectId);
                todo.status = status;
                saveTodos();
                renderTodos();
                document.getElementById('editTodoInput').style.display = 'none';
                editingTodoId = null;
                updateStats();
                showNotification('Todo updated successfully');
            }
        }
    });
    
    cancelEditTodo?.addEventListener('click', () => {
        document.getElementById('editTodoInput').style.display = 'none';
        editingTodoId = null;
    });
    
    weekFilter?.addEventListener('change', renderTodos);
    statusFilter?.addEventListener('change', renderTodos);
    typeFilter?.addEventListener('change', renderTodos);
}

// Setup team event listeners function
window.setupTeamEventListeners = function() {
    const addCollabBtn = document.getElementById('addCollabBtn');
    const collaboratorEmail = document.getElementById('collaboratorEmail');
    
    addCollabBtn?.addEventListener('click', () => {
        const email = collaboratorEmail.value.trim();
        if (email) {
            sendCollaborationRequest(email);
            collaboratorEmail.value = '';
        }
    });
}

window.deleteTodo = function(id) {
    todos = todos.filter(t => t.id !== id || t.userId !== currentUser.id);
    saveTodos();
    renderTodos();
    updateStats();
}

function saveTodos() {
    window.todos = todos;
    db.saveTodos(todos);
}

// Export todos to Excel
window.exportTodosToExcel = function() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates');
        return;
    }
    
    const userTodos = getUserTodos();
    const filteredTodos = userTodos.filter(todo => {
        const todoDate = new Date(todo.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return todoDate >= start && todoDate <= end;
    });
    
    if (filteredTodos.length === 0) {
        showNotification('No todos found in selected date range');
        return;
    }
    
    // Create CSV content
    const headers = ['Task', 'Status', 'Project', 'Date Created'];
    const csvContent = [headers.join(',')];
    
    filteredTodos.forEach(todo => {
        const projectName = getProjectName(todo.projectId);
        const row = [
            `"${todo.text}"`,
            todo.completed ? 'Completed' : 'Pending',
            `"${projectName}"`,
            todo.date
        ];
        csvContent.push(row.join(','));
    });
    
    // Download file
    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_${startDate}_to_${endDate}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification(`Exported ${filteredTodos.length} todos to Excel`);
}

// Generate and display reports
window.generateReport = function() {
    const weekFilter = document.getElementById('reportWeekFilter')?.value || 'all';
    const typeFilter = document.getElementById('reportTypeFilter')?.value || 'both';
    
    let allTodos = [];
    
    if (typeFilter === 'my' || typeFilter === 'both') {
        allTodos = allTodos.concat(getUserTodos());
    }
    
    if (typeFilter === 'team' || typeFilter === 'both') {
        allTodos = allTodos.concat(getSharedTodos());
    }
    
    const filteredTodos = filterTodos(allTodos, weekFilter, 'all');
    const totalTodos = filteredTodos.length;
    const completedTodos = filteredTodos.filter(t => (t.status || 'pending') === 'completed').length;
    const pendingTodos = totalTodos - completedTodos;
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    // Update stats
    const reportStats = document.getElementById('reportStats');
    if (reportStats) {
        reportStats.innerHTML = `
            <div class="report-stat">
                <span class="report-number">${totalTodos}</span>
                <span class="report-label">Total Todos</span>
            </div>
            <div class="report-stat">
                <span class="report-number">${completedTodos}</span>
                <span class="report-label">Completed</span>
            </div>
            <div class="report-stat">
                <span class="report-number">${pendingTodos}</span>
                <span class="report-label">Pending</span>
            </div>
            <div class="report-stat">
                <span class="report-number">${completionRate}%</span>
                <span class="report-label">Completion Rate</span>
            </div>
        `;
    }
    
    // Update details
    const reportDetails = document.getElementById('reportDetails');
    if (reportDetails) {
        reportDetails.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            reportDetails.innerHTML = '<p>No todos found</p>';
            return;
        }
        
        filteredTodos.forEach(todo => {
            const projectName = getProjectName(todo.projectId);
            const status = todo.status || 'pending';
            const statusLabel = getStatusLabel(status);
            const ownerName = todo.userId === currentUser.id ? 'Me' : getPartnerName(todo.userId);
            const reportItem = document.createElement('div');
            reportItem.className = `report-item ${status}`;
            reportItem.innerHTML = `
                <div><strong>${todo.text}</strong> <span style="font-size: 0.8rem; color: #666;">(${ownerName})</span></div>
                <div>Project: ${projectName}</div>
                <div>Status: ${statusLabel}</div>
                <div>Date: ${todo.date}</div>
            `;
            reportDetails.appendChild(reportItem);
        });
    }
}

// Export report to Excel
window.exportReportToExcel = function() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates');
        return;
    }
    
    const userTodos = getUserTodos();
    const filteredTodos = userTodos.filter(todo => {
        const todoDate = new Date(todo.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return todoDate >= start && todoDate <= end;
    });
    
    if (filteredTodos.length === 0) {
        showNotification('No todos found in selected date range');
        return;
    }
    
    // Calculate stats for the period
    const totalTodos = filteredTodos.length;
    const completedTodos = filteredTodos.filter(t => t.completed).length;
    const pendingTodos = totalTodos - completedTodos;
    const completionRate = Math.round((completedTodos / totalTodos) * 100);
    
    // Create CSV content with report header
    const csvContent = [
        'TODO REPORT',
        `Period: ${startDate} to ${endDate}`,
        `Generated: ${new Date().toLocaleDateString()}`,
        '',
        'SUMMARY',
        `Total Todos,${totalTodos}`,
        `Completed,${completedTodos}`,
        `Pending,${pendingTodos}`,
        `Completion Rate,${completionRate}%`,
        '',
        'DETAILED LIST',
        'Task,Status,Project,Date Created'
    ];
    
    filteredTodos.forEach(todo => {
        const projectName = getProjectName(todo.projectId);
        const row = [
            `"${todo.text}"`,
            todo.completed ? 'Completed' : 'Pending',
            `"${projectName}"`,
            todo.date
        ];
        csvContent.push(row.join(','));
    });
    
    // Download file
    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo_report_${startDate}_to_${endDate}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification(`Report exported with ${filteredTodos.length} todos`);
}

// View report in new tab
window.viewReportInTab = function() {
    const weekFilter = document.getElementById('reportWeekFilter')?.value || 'all';
    const typeFilter = document.getElementById('reportTypeFilter')?.value || 'both';
    
    if (!currentUser) {
        showNotification('Please login first');
        return;
    }
    
    // Generate URL with parameters
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '') + 'report.html';
    const params = new URLSearchParams({
        userId: currentUser.id,
        week: weekFilter,
        type: typeFilter
    });
    
    const reportUrl = `${baseUrl}?${params.toString()}`;
    
    // Open in new tab
    window.open(reportUrl, '_blank');
    showNotification('Report opened in new tab');
}