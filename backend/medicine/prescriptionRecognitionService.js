import { searchMedicine, getMedicineDetails } from './medicineDatabase';

export const analyzePrescriptionText = async (text) => {
  try {
    const lowerText = text.toLowerCase();
    
    // Extract potential medicine names using common patterns
    const potentialMedicines = extractPotentialMedicineNames(lowerText);
    
    // Search for each potential medicine in the database
    const medicines = await Promise.all(
      potentialMedicines.map(async (medicineName) => {
        const searchResults = await searchMedicine(medicineName);
        if (searchResults.length > 0) {
          const medicine = searchResults[0];
          return {
            name: medicine.name,
            dosage: extractDosage(lowerText, medicineName),
            frequency: extractFrequency(lowerText, medicineName),
            details: medicine.details
          };
        }
        return null;
      })
    );

    // Filter out null results
    const validMedicines = medicines.filter(m => m !== null);
    
    const diagnosis = extractDiagnosis(lowerText);
    const medicationPlan = generateMedicationPlan(validMedicines);

    return {
      medicines: validMedicines,
      diagnosis,
      medicationPlan
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

const extractPotentialMedicineNames = (text) => {
  // Common patterns that might indicate medicine names
  const patterns = [
    /tab\.\s+([a-zA-Z0-9\s-]+)/gi,  // Tab. MedicineName
    /cap\.\s+([a-zA-Z0-9\s-]+)/gi,  // Cap. MedicineName
    /inj\.\s+([a-zA-Z0-9\s-]+)/gi,  // Inj. MedicineName
    /\b(?:take|give)\s+([a-zA-Z0-9\s-]+)/gi,  // Take/Give MedicineName
  ];

  const potentialNames = new Set();
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        potentialNames.add(match[1].trim());
      }
    }
  });

  return Array.from(potentialNames);
};

// ... rest of the existing helper functions ...