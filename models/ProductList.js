const mongoose = require('mongoose');

const productListSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: { type: Date, required: true, expires: '5m' } // Auto-delete after 5 minutes
});

module.exports = mongoose.model('ProductList', productListSchema);