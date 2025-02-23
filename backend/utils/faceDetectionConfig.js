const path = require('path');

module.exports = {
  modelsPath: path.join(__dirname, '../models'),
  faceMatchThreshold: 0.6,
  detectorOptions: {
    scoreThreshold: 0.5,
    inputSize: 320
  }
};