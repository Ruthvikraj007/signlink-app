// services/searchService.js

// Mock users database with unique usernames (only for getUserByUsername fallback)
const mockUsersDatabase = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@signlink.com',
        userType: 'normal',
        avatar: '👨‍💻'
    },
    {
        id: '2',
        username: 'jeevan',
        email: 'jeevan@signlink.com',
        userType: 'normal',
        avatar: '👨‍💼'
    },
    {
        id: '3',
        username: 'shashank',
        email: 'shashank@signlink.com',
        userType: 'deaf',
        avatar: '👩‍🦰'
    },
    {
        id: '4',
        username: 'sukruth',
        email: 'sukruth@signlink.com',
        userType: 'normal',
        avatar: '👨‍🎤'
    },
    {
        id: '5',
        username: 'ruthvikraj',
        email: 'ruthvikraj@signlink.com',
        userType: 'deaf',
        avatar: '👩‍🎨'
    },
    {
        id: '6',
        username: 'alex',
        email: 'alex@signlink.com',
        userType: 'normal',
        avatar: '👦'
    },
    {
        id: '7',
        username: 'maya',
        email: 'maya@signlink.com',
        userType: 'deaf',
        avatar: '👧'
    },
    {
        id: '8',
        username: 'Ruthvikraj',
        email: 'ruthvikraj@gmail.com',
        userType: 'normal',
        avatar: '👨‍💼'
    },
    {
        id: '9',
        username: 'Ruthvik',
        email: 'ruthvik@gmail.com',
        userType: 'normal',
        avatar: '👨‍🎓'
    }
];

export const searchService = {
    searchUsers: async (query, currentUserId) => {
        try {
            console.log('🔍 [searchService] Searching users with query:', query);
            
            const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ [searchService] Search results from API:', data.users);
                return data.users;
            } else {
                console.error('❌ [searchService] Search failed:', data.error);
                return [];
            }
        } catch (error) {
            console.error('❌ [searchService] Search error:', error);
            // Return empty array instead of mock data to avoid confusion
            return [];
        }
    },

    getUserByUsername: async (username) => {
        console.log('🔍 [searchService] Getting user by username:', username);
        
        try {
            // Try to get user from backend API first
            const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(username)}`);
            const data = await response.json();
            
            if (data.success && data.users.length > 0) {
                const user = data.users[0];
                console.log('✅ [searchService] Found user from API:', user.username, user.id);
                return user;
            }
            
            // Fallback to mock data only if API fails
            console.log('🔄 [searchService] Falling back to mock data for:', username);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Case-insensitive search in mock data
            const user = mockUsersDatabase.find(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (user) {
                console.log('✅ [searchService] Found user in mock data:', user.username, user.id);
            } else {
                console.log('❌ [searchService] User not found in mock data:', username);
            }
            
            return user || null;

        } catch (error) {
            console.error('❌ [searchService] Error getting user:', error);
            return null;
        }
    },

    validateUsername: async (username) => {
        console.log('🔍 [searchService] Validating username:', username);
        
        try {
            const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(username)}`);
            const data = await response.json();
            
            if (data.success && data.users.length > 0) {
                console.log('✅ [searchService] Username exists in API');
                return true;
            }
            
            // Fallback to mock data check
            await new Promise(resolve => setTimeout(resolve, 200));
            const exists = mockUsersDatabase.some(u => u.username.toLowerCase() === username.toLowerCase());
            console.log('✅ [searchService] Username exists in mock data:', exists);
            return exists;

        } catch (error) {
            console.error('❌ [searchService] Error validating username:', error);
            return false;
        }
    },

    // Get all users except current user (for testing)
    getAllUsers: async (currentUserId) => {
        console.log('🔍 [searchService] Getting all users except current user');
        
        try {
            const response = await fetch(`http://localhost:5000/api/users`);
            const data = await response.json();
            
            if (data.success) {
                const users = data.users.filter(user => user.id !== currentUserId);
                console.log('✅ [searchService] All users from API:', users);
                return users;
            }
            
            // Fallback to mock data
            await new Promise(resolve => setTimeout(resolve, 500));
            const users = mockUsersDatabase.filter(user => user.id !== currentUserId);
            console.log('✅ [searchService] All users from mock data:', users);
            return users;

        } catch (error) {
            console.error('❌ [searchService] Error getting all users:', error);
            return [];
        }
    },

    // Debug function to see all users
    debugGetAllUsers: () => {
        console.log('=== 🔍 SEARCH SERVICE DEBUG ===');
        console.log('📊 All users in mock database:');
        mockUsersDatabase.forEach(user => {
            console.log(`  - ${user.username} (${user.id}) - ${user.email}`);
        });
        console.log('=== 🎯 END DEBUG ===');
        return mockUsersDatabase;
    }
};