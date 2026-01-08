const fetch = require('node-fetch');

async function checkProducts() {
    try {
        const response = await fetch('http://localhost:5000/products');
        const data = await response.json();
        if (data.success) {
            data.data.products.forEach(p => {
                console.log(`Product: ${p.name}`);
                console.log(`  images: ${JSON.stringify(p.images)}`);
                p.colors.forEach(c => {
                    console.log(`  Color: ${c.name}, imageUrl: ${c.imageUrl}`);
                });
            });
        } else {
            console.log('Failed to fetch products:', data.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkProducts();
