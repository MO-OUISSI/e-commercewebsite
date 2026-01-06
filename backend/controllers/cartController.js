const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Normalizes and validates the cart contents.
 * Removes items that no longer exist, are inactive, or whose variants are gone.
 * Also recalculates totals based on REAL DB prices.
 */
const normalizeCart = async (cart) => {
    if (!cart || !cart.items.length) return { items: [], subtotal: 0, total: 0 };

    let updatedItems = [];
    let subtotal = 0;
    let itemsChanged = false;

    for (let item of cart.items) {
        const product = await Product.findById(item.product);

        // 1. Remove if product doesn't exist or is inactive
        if (!product || !product.isActive) {
            itemsChanged = true;
            continue;
        }

        // 2. Find the specific color variant
        const colorVariant = product.colors.find(c => c.name === item.colorName);
        if (!colorVariant) {
            itemsChanged = true;
            continue;
        }

        // 3. Find the specific size variant
        const sizeVariant = colorVariant.sizes.find(s => s.label === item.sizeLabel);
        if (!sizeVariant) {
            itemsChanged = true;
            continue;
        }

        // 4. Check stock and adjust quantity if needed
        let finalQuantity = item.quantity;
        if (sizeVariant.stock <= 0) {
            itemsChanged = true;
            continue; // Remove item if out of stock
        }

        if (finalQuantity > sizeVariant.stock) {
            finalQuantity = sizeVariant.stock;
            itemsChanged = true;
        }

        // 5. Use DB Price (Security: Ignore frontend price)
        const effectivePrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

        updatedItems.push({
            _id: item._id,
            product: item.product,
            colorName: item.colorName,
            sizeLabel: item.sizeLabel,
            quantity: finalQuantity,
            price: effectivePrice,
            productDetails: {
                name: product.name,
                image: colorVariant.imageUrl,
                slug: product.slug
            }
        });

        subtotal += effectivePrice * finalQuantity;
    }

    if (itemsChanged) {
        cart.items = updatedItems.map(i => ({
            product: i.product,
            colorName: i.colorName,
            sizeLabel: i.sizeLabel,
            quantity: i.quantity
        }));
        await cart.save();
    }

    return {
        items: updatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: subtotal > 1000 ? 0 : 30, // Example shipping logic
        total: parseFloat((subtotal + (subtotal > 1000 ? 0 : 30)).toFixed(2))
    };
};

// GET Cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.headers['x-session-id'] || req.query.sessionId;

        let cart;
        if (userId) {
            cart = await Cart.findOne({ user: userId });
        } else if (sessionId) {
            cart = await Cart.findOne({ sessionId: sessionId });
        }

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: { items: [], subtotal: 0, total: 0 }
            });
        }

        const normalized = await normalizeCart(cart);
        res.status(200).json({
            success: true,
            cart: normalized
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ADD to Bag
exports.addToCart = async (req, res) => {
    try {
        const { productId, colorName, sizeLabel, quantity } = req.body;
        const userId = req.user ? req.user.id : null;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;

        // 1. Validate Product & Variant exists
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, message: "Product not available" });
        }

        const colorVariant = product.colors.find(c => c.name === colorName);
        if (!colorVariant) return res.status(400).json({ success: false, message: "Color variant not found" });

        const sizeVariant = colorVariant.sizes.find(s => s.label === sizeLabel);
        if (!sizeVariant) return res.status(400).json({ success: false, message: "Size variant not found" });

        // 2. Check Stock
        if (sizeVariant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${sizeVariant.stock} items left in stock`,
                availableStock: sizeVariant.stock
            });
        }

        // 3. Find or Create Cart
        let cart;
        if (userId) {
            cart = await Cart.findOne({ user: userId });
        } else if (sessionId) {
            cart = await Cart.findOne({ sessionId: sessionId });
        }

        if (!cart) {
            cart = new Cart({
                user: userId || undefined,
                sessionId: userId ? undefined : sessionId,
                items: []
            });
        }

        // 4. Update or Add item
        const existingItemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            item.colorName === colorName &&
            item.sizeLabel === sizeLabel
        );

        if (existingItemIndex > -1) {
            // Check collective stock for existing + new
            const newTotalQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (sizeVariant.stock < newTotalQuantity) {
                return res.status(400).json({
                    success: false,
                    message: "Total quantity exceeds available stock",
                    availableStock: sizeVariant.stock
                });
            }
            cart.items[existingItemIndex].quantity = newTotalQuantity;
        } else {
            cart.items.push({ product: productId, colorName, sizeLabel, quantity });
        }

        await cart.save();
        const normalized = await normalizeCart(cart);

        res.status(200).json({
            success: true,
            message: "Added to bag successfully",
            cart: normalized
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// REMOVE/UPDATE Item
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body; // itemId is the _id of the item in the array
        const userId = req.user ? req.user.id : null;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;

        let cart;
        if (userId) {
            cart = await Cart.findOne({ user: userId });
        } else if (sessionId) {
            cart = await Cart.findOne({ sessionId: sessionId });
        }

        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) return res.status(404).json({ success: false, message: "Item not found in cart" });

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Re-validate stock for update
            const item = cart.items[itemIndex];
            const product = await Product.findById(item.product);
            const colorVariant = product.colors.find(c => c.name === item.colorName);
            const sizeVariant = colorVariant.sizes.find(s => s.label === item.sizeLabel);

            if (sizeVariant.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${sizeVariant.stock} items currently in stock`
                });
            }
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        const normalized = await normalizeCart(cart);

        res.status(200).json({
            success: true,
            cart: normalized
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
