import apiClient from './apiClient';

const collectionService = {
    /**
     * Fetch all active collections
     */
    getCollections: async () => {
        try {
            const response = await apiClient.get('/collections');
            return response.data;
        } catch (error) {
            console.error('Error fetching collections:', error);
            throw error;
        }
    }
};

export default collectionService;
