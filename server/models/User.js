const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'caregiver'], default: 'patient' },
    caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    allergies: [{
        allergen: String,
        reaction: String,
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
    }],
    createdAt: { type: Date, default: Date.now }
});


UserSchema.methods.comparePassword = async function(candidatePassword) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);