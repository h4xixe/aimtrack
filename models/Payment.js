const mongoose = require('mongoose');

     const paymentSchema = new mongoose.Schema({
         userId: { type: String, required: true },
         pixCode: { type: String, required: true },
         amount: { type: Number, required: true },
         productId: { type: String, required: true },
         planIndex: { type: Number, required: true },
         status: { type: String, default: 'pending' },
         createdAt: { type: Date, required: true },
         updatedAt: { type: Date }
     });

     module.exports = mongoose.model('Payment', paymentSchema);