const mongoose = require('mongoose');
const Product = require('./Product');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        match: /^#\d{6}$/,
        validate: {
            validator: async function (value) {
                const product = await Product.findOne({ productId: value });
                return !!product;
            },
            message: 'Product ID must correspond to an existing Product.'
        }
    },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

// Sync name from Product on save
productSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('productId')) {
        const product = await Product.findOne({ productId: this.productId });
        if (product) {
            this.name = product.nome;
        }
    }
    next();
});

module.exports = mongoose.model('AuthProduct', productSchema);