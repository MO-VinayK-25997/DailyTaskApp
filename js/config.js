// Configuration for different hosting environments
const CONFIG = {
    // Firebase configuration
    firebase: {
        databaseURL: 'https://dailytaskapp-fd302-default-rtdb.firebaseio.com/',
        // Add your domain to Firebase authorized domains
        authorizedDomains: [
            'localhost',
            'mo-vinayk-25997.github.io',
            'your-ftp-domain.com' // Replace with your FTP domain
        ]
    },
    
    // Fallback users for when Firebase is not accessible
    fallbackUsers: [
        {
            id: 1,
            username: 'admin',
            email: 'admin@test.com',
            password: '123456',
            role: 'admin',
            joinDate: new Date().toLocaleDateString()
        },
        {
            id: 2,
            username: 'user',
            email: 'user@test.com',
            password: '123456',
            role: 'user',
            joinDate: new Date().toLocaleDateString()
        }
    ]
};

window.CONFIG = CONFIG;