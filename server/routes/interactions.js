const express = require('express');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');
const router = express.Router();


const knownInteractions = {
    'warfarin:aspirin': ' Warfarin and Aspirin both affect blood clotting - increased bleeding risk',
    'warfarin:ibuprofen': ' Warfarin and Ibuprofen - increased bleeding risk',
    'lisinopril:ibuprofen': ' Lisinopril and Ibuprofen - Ibuprofen may reduce blood pressure control',
    'metformin:contrast': ' Metformin and contrast dye - risk of kidney damage',
    'simvastatin:grapefruit': ' Simvastatin and Grapefruit - grapefruit increases statin levels',
    'amiodarone:simvastatin': ' Amiodarone and Simvastatin - increased risk of muscle damage',
    'digoxin:furosemide': ' Digoxin and Furosemide - risk of low potassium increasing digoxin toxicity',
    'methotrexate:aspirin': ' Methotrexate and Aspirin - increased methotrexate toxicity'
};


router.get('/check-all', auth, async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ userId: req.user.id, isActive: true });
        const drugs = prescriptions.map(p => p.drugName.toLowerCase());
        const interactions = [];
        
        for (let i = 0; i < drugs.length; i++) {
            for (let j = i + 1; j < drugs.length; j++) {
                const key = `${drugs[i]}:${drugs[j]}`;
                const reverseKey = `${drugs[j]}:${drugs[i]}`;
                const warning = knownInteractions[key] || knownInteractions[reverseKey];
                
                if (warning) {
                    interactions.push({
                        drug1: drugs[i],
                        drug2: drugs[j],
                        warning: warning
                    });
                }
            }
        }
        
        res.json({ 
            interactions, 
            totalDrugs: drugs.length,
            message: interactions.length === 0 ? 'No interactions found' : `${interactions.length} interaction(s) detected`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Check specific drug pair
router.post('/check-pair', async (req, res) => {
    try {
        const { drug1, drug2 } = req.body;
        const key = `${drug1.toLowerCase()}:${drug2.toLowerCase()}`;
        const reverseKey = `${drug2.toLowerCase()}:${drug1.toLowerCase()}`;
        const warning = knownInteractions[key] || knownInteractions[reverseKey];
        
        if (warning) {
            res.json({
                interacts: true,
                warning: warning,
                drug1: drug1,
                drug2: drug2
            });
        } else {
            res.json({
                interacts: false,
                message: `No known interaction between ${drug1} and ${drug2}`,
                drug1: drug1,
                drug2: drug2
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;