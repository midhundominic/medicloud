// Utility to generate random 4-digit admission number
const generateAdmissionNumber = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit number
  };
  
  module.exports = generateAdmissionNumber;
  