const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: false },
    licenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'License', required: false },
    expiry: { type: Date, required: true },
    ip: { type: String, required: true },
    hwid: { type: String, required: false }
});

module.exports = mongoose.model('Session', sessionSchema);