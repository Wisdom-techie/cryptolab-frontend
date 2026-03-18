// Admin API methods
const adminAPI = {
  searchUsers: async (query) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/users/search`,
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (error) {
      console.error('❌ User search error:', error);
      throw error;
    }
  },

  updateUserBalance: async (userId, balanceUpdate) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/users/${userId}/balance`,
        balanceUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response;
    } catch (error) {
      console.error('❌ Balance update error:', error);
      throw error;
    }
  }
};

export const searchUsers = adminAPI.searchUsers;
export const updateUserBalance = adminAPI.updateUserBalance;