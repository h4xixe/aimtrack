const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // senha em texto puro
    email: { type: String, required: true, unique: true },
    licenseKey: { type: String, required: false },
    discordId: { type: String },
    discordUsername: { type: String }, // New field
    discordCreateDate: { type: Date }, // New field
    discordAvatar: { type: String }, // New field
    profilePicture: { type: String, required: false },
    banner: { type: String, required: false },
    ip: { type: String },
    hwid: { type: String },
    banned: { type: Boolean, default: false },
    resetsAvailable: { type: Number, default: 2 },
    createdAt: { type: Date, default: Date.now }
});

// Remover hash de senha
// Não há mais necessidade do pre-save
// userSchema.pre('save', async function (next) { ... });

module.exports = mongoose.model('AuthUser', userSchema);
