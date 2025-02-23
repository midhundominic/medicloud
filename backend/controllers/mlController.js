const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:5002/api/ml';

const mlController = {
    analyzePrescription: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No prescription image uploaded' 
                });
            }

            const formData = new FormData();
            
            // Create a Buffer from the file data
            const buffer = req.file.buffer;
            
            // Append the file to form data
            formData.append('prescription', buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                knownLength: buffer.length
            });

            const response = await axios.post(
                `${ML_SERVER_URL}/analyze-prescription`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Accept': 'application/json',
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            res.json(response.data);
        } catch (error) {
            console.error('Error analyzing prescription:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                message: 'Error analyzing prescription',
                error: error.response?.data?.error || error.message
            });
        }
    },
    predictDisease: async (req, res) => {
        try {
            const response = await axios.post(
                `${ML_SERVER_URL}/predict-disease`,
                req.body,
                { timeout: 30000 }
            );
            
            res.json(response.data);
        } catch (error) {
            console.error('Error predicting disease:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                message: 'Error predicting disease',
                error: error.response?.data?.error || error.message
            });
        }
    }
};

module.exports = mlController;
