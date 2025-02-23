const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const analyzePrescription = async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({
                success: false,
                error: 'No image data provided'
            });
        }

        // Initialize the model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Extract base64 data
        const base64Data = imageData.includes('base64,') 
            ? imageData.split('base64,')[1] 
            : imageData;

        // Create the image part for Gemini
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
            }
        };

        // Prepare the prompt
        const prompt = {
            text: "You are a medical professional analyzing a prescription. Please extract and format the following information clearly:\n" +
                "1. Medicine Names (list each medicine separately)\n" +
                "2. Dosage Instructions (for each medicine)\n" +
                "3. Duration of Treatment\n" +
                "4. Special Instructions or Notes\n\n" +
                "Please format the response clearly with headings and bullet points."
        };

        try {
            // Generate content
            const result = await model.generateContent([prompt, imagePart]);
            await result.response;
            
            const response = await result.response;
            const analyzedText = response.text();

            if (!analyzedText) {
                return res.status(400).json({
                    success: false,
                    error: 'No analysis results received'
                });
            }

            return res.status(200).json({
                success: true,
                data: analyzedText
            });

        } catch (aiError) {
            console.error('AI Processing Error Details:', aiError);
            return res.status(500).json({
                success: false,
                error: 'AI service error: ' + (aiError.message || 'Unknown error')
            });
        }

    } catch (error) {
        console.error('General Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error: ' + (error.message || 'Unknown error')
        });
    }
};

module.exports = {
    analyzePrescription
};