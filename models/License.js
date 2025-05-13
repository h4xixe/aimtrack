const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    expiry: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: false },
    banned: { type: Boolean, default: false },
    ip: { type: String },
    hwid: { type: String },
    discordId: { type: String },
    discordUsername: { type: String }, // New field
    discordCreateDate: { type: Date }, // New field
    discordAvatar: { type: String } // New field
});

module.exports = mongoose.model('License', licenseSchema);