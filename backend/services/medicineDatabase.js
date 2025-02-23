const axios = require('axios');
require('dotenv').config();

const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';
const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';
const OPENFDA_API_KEY = process.env.OPENFDA_API_KEY;

// Common medicine types and their dosage forms
const MEDICINE_TYPES = {
  TABLET: ['tablet', 'tablets', 'oral tablet', 'film coated tablet'],
  SYRUP: ['syrup', 'oral solution', 'suspension', 'liquid'],
  INJECTION: ['injection', 'injectable', 'intravenous', 'intramuscular'],
  CAPSULE: ['capsule', 'capsules', 'oral capsule'],
  CREAM: ['cream', 'topical cream', 'ointment', 'gel'],
  OTHER: ['other']
};

const getMedicineType = (dosageForm) => {
  const lowerForm = dosageForm?.toLowerCase() || '';
  
  for (const [type, forms] of Object.entries(MEDICINE_TYPES)) {
    if (forms.some(form => lowerForm.includes(form))) {
      return type.toLowerCase();
    }
  }
  return 'other';
};

const extractStrength = (name) => {
  // Enhanced pattern to match various strength formats
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:mg|mcg|g|ml|%)/i,  // Basic numbers with units
    /(\d+(?:\.\d+)?\/\d+(?:\.\d+)?)\s*(?:mg|mcg|g|ml|%)/i,  // Fractions
    /(\d+(?:\.\d+)?)\s*(?:milligram|microgram|gram|milliliter|percent)/i  // Full unit names
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const searchMedicine = async (searchTerm) => {
  try {
    // First try OpenFDA
    const openFdaUrl = `${OPENFDA_BASE_URL}/ndc.json?search=generic_name:${encodeURIComponent(searchTerm)}+brand_name:${encodeURIComponent(searchTerm)}&limit=10`;
    const openFdaResponse = await axios.get(openFdaUrl);
    
    if (openFdaResponse.data.results?.length > 0) {
      return openFdaResponse.data.results.map(result => {
        const medicineType = getMedicineType(result.dosage_form);
        const strength = result.active_ingredients?.[0]?.strength || extractStrength(result.generic_name) || 'Not specified';
        
        return {
          name: result.brand_name || result.generic_name,
          genericName: result.generic_name,
          brandName: result.brand_name,
          dosageForm: result.dosage_form,
          medicineType,
          strength,
          rxnormId: result.openfda?.rxcui?.[0],
          details: {
            manufacturer: result.labeler_name,
            route: result.route,
            packaging: result.packaging?.[0]?.description,
            warnings: result.warnings?.[0],
            storage: result.storage_and_handling?.[0],
            activeIngredients: result.active_ingredients?.map(ing => ({
              name: ing.name,
              strength: ing.strength
            }))
          }
        };
      });
    }

    // If no results from OpenFDA, try RxNorm
    const rxnavUrl = `${RXNORM_BASE_URL}/spellingsuggestions.json?name=${encodeURIComponent(searchTerm)}`;
    const rxnavResponse = await axios.get(rxnavUrl);
    
    if (rxnavResponse.data.suggestionGroup?.suggestionList?.suggestion) {
      const suggestions = rxnavResponse.data.suggestionGroup.suggestionList.suggestion;
      const medicinePromises = suggestions.map(async (name) => {
        const detailsUrl = `${RXNORM_BASE_URL}/rxcui.json?name=${encodeURIComponent(name)}`;
        const detailsResponse = await axios.get(detailsUrl);
        
        if (detailsResponse.data.idGroup?.rxnormId) {
          const rxcui = detailsResponse.data.idGroup.rxnormId;
          const propertyUrl = `${RXNORM_BASE_URL}/rxcui/${rxcui}/allProperties.json?prop=all`;
          const propertyResponse = await axios.get(propertyUrl);
          
          const properties = propertyResponse.data.propConceptGroup?.propConcept || [];
          const dosageForm = properties.find(p => p.propName === 'DOSE_FORM')?.propValue;
          const strength = properties.find(p => p.propName === 'STRENGTH')?.propValue;
          const medicineType = getMedicineType(dosageForm);
          
          return {
            name: name,
            genericName: properties.find(p => p.propName === 'RxNorm Name')?.propValue || name,
            brandName: properties.find(p => p.propName === 'BRAND_NAME')?.propValue,
            dosageForm: dosageForm || 'Not specified',
            medicineType,
            strength: strength || extractStrength(name) || 'Not specified',
            rxnormId: rxcui,
            details: {
              manufacturer: 'Generic',
              route: properties.find(p => p.propName === 'ROUTE')?.propValue,
              packaging: null,
              warnings: null,
              storage: 'Store in a cool, dry place',
              activeIngredients: [{
                name: properties.find(p => p.propName === 'INGREDIENT')?.propValue,
                strength: strength
              }]
            }
          };
        }
        return null;
      });

      const results = await Promise.all(medicinePromises);
      return results.filter(result => result !== null);
    }

    return [];
  } catch (error) {
    console.error('Error searching medicine:', error);
    throw new Error('Failed to search medicine database');
  }
};

module.exports = {
  searchMedicine
};