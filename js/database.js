// Database Module - Firebase
class Database {
    constructor() {
        this.baseUrl = 'https://dailytaskapp-fd302-default-rtdb.firebaseio.com/';
    }

    async readData(key) {
        try {
            const response = await fetch(`${this.baseUrl}${key}.json`);
            if (!response.ok) {
                console.error(`HTTP Error ${response.status}: ${response.statusText}`);
                return key === 'currentUser' ? null : [];
            }
            const data = await response.json();
            return data || (key === 'currentUser' ? null : []);
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            // Return empty data for GitHub Pages compatibility
            return key === 'currentUser' ? null : [];
        }
    }

    async writeData(key, data) {
        try {
            const response = await fetch(`${this.baseUrl}${key}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                console.error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
            return response.ok;
        } catch (error) {
            console.error(`Error writing ${key}:`, error);
            // For GitHub Pages, fall back to localStorage
            try {
                localStorage.setItem(`dailyTaskApp_${key}`, JSON.stringify(data));
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    // Users
    async getUsers() {
        return await this.readData('users');
    }

    async saveUsers(users) {
        return await this.writeData('users', users);
    }

    // Todos
    async getTodos() {
        return await this.readData('todos');
    }

    async saveTodos(todos) {
        return await this.writeData('todos', todos);
    }

    // Projects
    async getProjects() {
        return await this.readData('projects');
    }

    async saveProjects(projects) {
        return await this.writeData('projects', projects);
    }

    // Team Members
    async getTeamMembers() {
        return await this.readData('teamMembers');
    }

    async saveTeamMembers(teamMembers) {
        return await this.writeData('teamMembers', teamMembers);
    }

    // Active Collaborations
    async getActiveCollaborations() {
        return await this.readData('activeCollaborations');
    }

    async saveActiveCollaborations(collaborations) {
        return await this.writeData('activeCollaborations', collaborations);
    }

    // Collaboration Requests
    async getCollaborationRequests() {
        return await this.readData('collaborationRequests');
    }

    async saveCollaborationRequests(requests) {
        return await this.writeData('collaborationRequests', requests);
    }

    // Current User Session (Local Storage Only)
    async getCurrentUser() {
        try {
            const data = localStorage.getItem('dailyTaskApp_currentUser');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    async saveCurrentUser(user) {
        try {
            if (user) {
                localStorage.setItem('dailyTaskApp_currentUser', JSON.stringify(user));
            } else {
                localStorage.removeItem('dailyTaskApp_currentUser');
            }
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Global database instance
window.db = new Database();