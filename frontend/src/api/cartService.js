import apiClient from './apiClient';

const cartService = {
    /**
     * Get the current cart (handles sessionId internally or via headers)
     */
    getCart: async (sessionId) => {
        try {
            const config = sessionId ? { headers: { 'x-session-id': sessionId } } : {};
            const response = await apiClient.get('/cart', config);
            return response.data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    /**
     * Add an item to the cart
     */
    addToCart: async (itemData) => {
        try {
            // itemData: { productId, colorName, sizeLabel, quantity, sessionId }
            const response = await apiClient.post('/cart/add', itemData);
            return response.data;
        } catch (error) {
            console.error('Error adding to bag:', error);
            throw error;
        }
    },

    /**
     * Update item quantity or remove item (quantity: 0)
     */
    updateCartItem: async (updateData) => {
        try {
            // updateData: { itemId, quantity, sessionId }
            const response = await apiClient.put('/cart/update', updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    }
};

export default cartService;
