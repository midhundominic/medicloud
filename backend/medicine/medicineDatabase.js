const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';
const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';

export const searchMedicine = async (searchTerm) => {
  try {
    // First try RxNorm API
    const rxnormResponse = await fetch(
      `${RXNORM_BASE_URL}/drugs?name=${encodeURIComponent(searchTerm)}`
    );
    const rxnormData = await rxnormResponse.json();

    if (rxnormData.drugGroup?.conceptGroup) {
      return formatRxNormResults(rxnormData.drugGroup.conceptGroup);
    }

    // If no results from RxNorm, try OpenFDA
    const openFdaResponse = await fetch(
      `${OPENFDA_BASE_URL}/ndc.json?search=brand_name:${encodeURIComponent(searchTerm)}&limit=5`
    );
    const openFdaData = await openFdaResponse.json();

    return formatOpenFdaResults(openFdaData.results);
  } catch (error) {
    console.error('Error fetching medicine data:', error);
    throw error;
  }
};

const formatRxNormResults = (conceptGroups) => {
  const medicines = [];
  
  conceptGroups.forEach(group => {
    if (group.conceptProperties) {
      group.conceptProperties.forEach(prop => {
        medicines.push({
          name: prop.name,
          rxcui: prop.rxcui,
          synonym: prop.synonym,
          details: {
            usage: group.tty || 'Not specified',
            warnings: 'Please consult healthcare provider for specific warnings',
            commonDosages: []
          }
        });
      });
    }
  });

  return medicines;
};

const formatOpenFdaResults = (results) => {
  return results.map(result => ({
    name: result.brand_name || result.generic_name,
    details: {
      usage: result.dosage_form,
      warnings: result.warnings || 'Please consult healthcare provider for specific warnings',
      commonDosages: result.active_ingredients?.map(ing => 
        `${ing.strength}`
      ) || []
    }
  }));
};

// Get detailed information for a specific medicine
export const getMedicineDetails = async (rxcui) => {
  try {
    const response = await fetch(
      `${RXNORM_BASE_URL}/rxcui/${rxcui}/allrelated`
    );
    const data = await response.json();
    return formatMedicineDetails(data);
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    throw error;
  }
};

const formatMedicineDetails = (data) => {
  // Extract relevant information from the API response
  const details = {
    strength: [],
    dosageForm: [],
    brandNames: [],
    genericNames: []
  };

  if (data.allRelatedGroup?.conceptGroup) {
    data.allRelatedGroup.conceptGroup.forEach(group => {
      switch (group.tty) {
        case 'SBD': // Semantic Branded Drug
          group.conceptProperties?.forEach(prop => 
            details.brandNames.push(prop.name)
          );
          break;
        case 'SCD': // Semantic Clinical Drug
          group.conceptProperties?.forEach(prop => 
            details.genericNames.push(prop.name)
          );
          break;
        case 'SCDC': // Semantic Clinical Drug Component
          group.conceptProperties?.forEach(prop => 
            details.strength.push(prop.name)
          );
          break;
        case 'DF': // Dose Form
          group.conceptProperties?.forEach(prop => 
            details.dosageForm.push(prop.name)
          );
          break;
      }
    });
  }

  return details;
};