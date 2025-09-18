// Database Module - Firebase
class Database {
    constructor() {
        // Force HTTPS for GitHub Pages compatibility
        this.baseUrl = 'https://dailytaskapp-fd302-default-rtdb.firebaseio.com/';
        console.log('Database initialized with URL:', this.baseUrl);
        
        // Test connection immediately
        this.testConnection();
    }
    
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}.json`);
            console.log('Firebase connection test:', response.status, response.ok);
        } catch (error) {
            console.error('Firebase connection failed:', error);
        }
    }

    async readData(key) {
        try {
            console.log(`Fetching ${key} from Firebase...`);
            const response = await fetch(`${this.baseUrl}${key}.json`);
            console.log(`Response status for ${key}:`, response.status);
            
            if (!response.ok) {
                console.error(`HTTP Error ${response.status}: ${response.statusText}`);
                // Try localStorage fallback
                const localData = localStorage.getItem(`dailyTaskApp_${key}`);
                return localData ? JSON.parse(localData) : (key === 'currentUser' ? null : []);
            }
            
            const data = await response.json();
            console.log(`Data received for ${key}:`, data);
            
            // Cache in localStorage
            if (data && key !== 'currentUser') {
                localStorage.setItem(`dailyTaskApp_${key}`, JSON.stringify(data));
            }
            
            return data || (key === 'currentUser' ? null : []);
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            // Fallback to localStorage
            const localData = localStorage.getItem(`dailyTaskApp_${key}`);
            return localData ? JSON.parse(localData) : (key === 'currentUser' ? null : []);
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