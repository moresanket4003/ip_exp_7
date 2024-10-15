const express = require('express');
const bodyParser = require('body-parser');
const products = require('./data/products');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

// Middleware to parse JSON and form requests
app.use(express.urlencoded({ extended: true }));

// 1. Get all products
app.get('/api/products', (req, res) => {
    res.status(200).json({ success: true, data: products });
});

// 2. Get product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
});

// 3. Search products based on query parameters (name, category, price range)
app.get('/api/products/search', (req, res) => {
    let filteredProducts = products; // Start with all products
    const { name, category, minPrice, maxPrice } = req.query;

    console.log('Search Query:', req.query); // Debugging log to see the incoming query

    // Filter by name (if provided)
    if (name) {
        console.log(`Filtering by name: ${name}`);
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    // Filter by category (if provided)
    if (category) {
        console.log(`Filtering by category: ${category}`);
        filteredProducts = filteredProducts.filter(p =>
            p.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Filter by minimum price (if provided)
    if (minPrice) {
        console.log(`Filtering by minPrice: ${minPrice}`);
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    // Filter by maximum price (if provided)
    if (maxPrice) {
        console.log(`Filtering by maxPrice: ${maxPrice}`);
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    // If no products match the filters
    if (filteredProducts.length === 0) {
        return res.status(404).json({ success: false, message: 'No products found matching the search criteria' });
    }

    // Return the filtered products
    res.status(200).json({ success: true, data: filteredProducts });
});

// 4. Add a new product (POST)
app.post('/api/products', (req, res) => {
    const { name, category, price, stock } = req.body;
    const newProduct = {
        id: products.length + 1,
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock)
    };

    products.push(newProduct);
    res.status(201).json({ success: true, message: 'Product added', data: newProduct });
});

// 5. Update an existing product (PUT)
app.put('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, category, price, stock } = req.body;
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = {
        id: productId,
        name: name || products[productIndex].name,
        category: category || products[productIndex].category,
        price: price ? parseFloat(price) : products[productIndex].price,
        stock: stock ? parseInt(stock) : products[productIndex].stock
    };

    products[productIndex] = updatedProduct;
    res.status(200).json({ success: true, message: 'Product updated', data: updatedProduct });
});

// 6. Delete a product (DELETE)
app.delete('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.status(200).json({ success: true, message: 'Product deleted' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
