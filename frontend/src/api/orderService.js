import apiClient from './apiClient';

const orderService = {
    /**
     * Creates a new order.
     * @param {Object} orderData - The customer and order item details.
     * @returns {Promise<Object>} The API response.
     */
    createOrder: async (orderData) => {
        try {
            const response = await apiClient.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
};

export default orderService;
