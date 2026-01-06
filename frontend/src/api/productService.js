import apiClient from './apiClient';

const productService = {
    /**
     * Fetch products with optional filtering
     * @param {Object} params { category, search }
     */
    getAllProducts: async (params = {}) => {
        try {
            const response = await apiClient.get('/products', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    /**
     * Fetch a single product by ID
     * @param {string} id 
     */
    getProductById: async (id) => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    }
};

export default productService;
