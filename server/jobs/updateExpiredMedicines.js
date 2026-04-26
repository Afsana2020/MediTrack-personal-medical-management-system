const Medicine = require('../models/Medicine');

const updateExpiredMedicines = async () => {
    try {
        const now = new Date();
        const result = await Medicine.updateMany(
            { endDate: { $lt: now }, isActive: true },
            { $set: { isActive: false } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} expired medicines to inactive`);
        }
    } catch (error) {
        console.error('Error updating expired medicines:', error);
    }
};

module.exports = updateExpiredMedicines;