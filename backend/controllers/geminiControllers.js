const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatMessage = require('../models/geminiModel');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const Medicine = require('../models/medicineModel');
const Labtest = require('../models/labTestModel');
const Prescription = require('../models/prescriptionModel');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Add the HEALTHCARE_PROMPT constant
const HEALTHCARE_PROMPT = `You are a helpful healthcare assistant for eCare. Your role is to:
1. Provide information about our doctors and their specializations
2. Help users understand their upcoming appointments
3. Provide details about available lab tests and their purposes
4. Share information about medicines and their general uses
5. Assist with understanding prescriptions

Please ensure responses are:
- Clear and easy to understand
- Based only on the provided data
- Include a reminder that this is for informational purposes only
- Professional yet conversational in tone

Remember to maintain patient privacy and never share sensitive medical information.`;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
}

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
});

const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

const chatWithGemini = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Fetch relevant data based on the query
        let contextData = {};
        
        if (message.toLowerCase().includes('doctor')) {
            const doctors = await Doctor.find({ isDisabled: false })
                .select('firstName lastName specialization y_experience aboutDoctor rating');
            contextData.doctors = doctors;
        }

        if (message.toLowerCase().includes('appointment')) {
            const appointments = await Appointment.find({ 
                patientId: userId,
                appointmentDate: { $gte: new Date() },
                status: { $in: ['scheduled', 'rescheduled'] }
            })
            .populate('doctorId', 'firstName lastName specialization')
            .sort({ appointmentDate: 1 });
            contextData.appointments = appointments;
        }

        if (message.toLowerCase().includes('medicine')) {
            const medicines = await Medicine.find()
                .select('name manufacturer description');
            contextData.medicines = medicines;
        }

        if (message.toLowerCase().includes('test') || message.toLowerCase().includes('lab')) {
            const tests = await Labtest.find()
                .select('label amount');
            contextData.tests = tests;
        }

        // Create context prompt based on available data
        let contextPrompt = `Please provide information based on the following data:\n`;
        
        if (contextData.doctors) {
            contextPrompt += `Available Doctors: ${JSON.stringify(contextData.doctors)}\n`;
        }
        if (contextData.appointments) {
            contextPrompt += `Your Upcoming Appointments: ${JSON.stringify(contextData.appointments)}\n`;
        }
        if (contextData.medicines) {
            contextPrompt += `Available Medicines: ${JSON.stringify(contextData.medicines)}\n`;
        }
        if (contextData.tests) {
            contextPrompt += `Available Lab Tests: ${JSON.stringify(contextData.tests)}\n`;
        }

        contextPrompt += `\nUser Question: ${message}\n`;
        contextPrompt += `\nPlease provide a clear, organized response based on the available data. Include relevant details but maintain a conversational tone.`;

        const chat = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [{ text: HEALTHCARE_PROMPT }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand and will provide information based on the available data." }],
                },
            ],
        });

        const result = await chat.sendMessage(contextPrompt);
        const response = result.response.text();

        // Save chat message
        const chatMessage = new ChatMessage({
            userId,
            message,
            response,
            category: determineCategory(message),
            timestamp: new Date()
        });

        await chatMessage.save();

        return res.status(201).json({
            success: true,
            response
        });

    } catch (error) {
        console.error('Error in chatWithGemini:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process chat message'
        });
    }
};

// Helper function to determine message category
const determineCategory = (message) => {
    message = message.toLowerCase();
    if (message.includes('doctor')) return 'doctors';
    if (message.includes('appointment')) return 'appointments';
    if (message.includes('test') || message.includes('lab')) return 'lab_tests';
    if (message.includes('medicine') || message.includes('prescription')) return 'medications';
    return 'general';
};

const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const history = await ChatMessage.find({ 
            userId,
        })
        .sort({ timestamp: 1 })
        .limit(50);

        res.status(201).json({ 
            success: true, 
            history 
        });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error fetching chat history' 
        });
    }
};

module.exports = {
    chatWithGemini,
    getChatHistory
};