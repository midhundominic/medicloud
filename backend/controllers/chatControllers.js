const ChatMessage = require('../models/chatModel');
const OpenAI = require('openai');
const DoctorModel = require('../models/doctorModel');

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced system message specific to your medical platform
const SYSTEM_MESSAGE = `You are an AI assistant for our medical platform. Please format your responses with proper line breaks and clear sections.

When providing information:
1. Use proper paragraphs with line breaks
2. List items should be on new lines with bullet points
3. Include doctor names and specializations when relevant
4. Format responses in a clear, readable manner

Your role includes:

1. Doctor Information:
   • Provide specific doctor names and their specializations
   • Include years of experience when available
   • Mention doctor's availability for appointments
   • List consultation hours and specialties

2. Medical Services:
   • Laboratory services and available tests
   • Treatment options and procedures
   • Appointment booking process
   • Prescription system usage

3. Response Guidelines:
   • Use clear paragraphs with line breaks
   • Start each new topic on a new line
   • Format lists with proper bullets
   • Include relevant doctor names when discussing specializations

4. Important Notes:
   • Always format responses in a structured manner
   • Use bullet points for lists
   • Include line breaks between sections
   • Maintain professional and clear formatting

Remember: Format all responses with proper spacing and structure for better readability.`;

const formatResponse = (text) => {
  // First, split the text into sections
  const sections = text.split(/(?=###|Doctor|Available|Specialization)/g);
  
  // Format each section
  return sections
    .map(section => {
      return section
        // Add proper spacing for headings
        .replace(/###\s*([^\n]+)/g, '\n$1\n')
        // Format main bullet points
        .replace(/•\s*/g, '\n• ')
        // Format doctor entries
        .replace(/Dr\.\s+([^\n]+)/g, '\nDr. $1')
        // Format key-value pairs
        .replace(/(-\s*[A-Za-z]+:)/g, '\n    $1')
        // Add line breaks after sentences
        .replace(/([.!?])\s+/g, '$1\n')
        // Format list items
        .replace(/(\d+\.\s+[^\n]+)/g, '\n$1')
        .trim();
    })
    .join('\n\n')
    // Clean up multiple line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Ensure consistent indentation
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
};

const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get detailed doctor information
    const doctors = await DoctorModel.find({}, 
      'specialization firstName lastName experience y_experience aboutDoctor'
    );
    const specializations = [...new Set(doctors.map(doc => doc.specialization))];

    // Create structured context with consistent formatting
    const contextMessage = `
Available Doctors:

${doctors.map(doc => `
Dr. ${doc.firstName} ${doc.lastName}
    Specialization: ${doc.specialization}
    Experience: ${doc.y_experience} years
    About: ${doc.aboutDoctor || 'Available for consultations'}`).join('\n\n')}

Available Specializations:
${specializations.map(spec => `• ${spec}`).join('\n')}

Format Guidelines:
1. Start each section with a clear heading
2. Use bullet points for lists
3. Add line breaks between sections
4. Indent details under main points
5. Keep consistent spacing throughout
`;

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a medical assistant. Please format your responses with:
            - Clear section headings
            - Proper line breaks between sections
            - Bullet points for lists
            - Consistent indentation
            - Professional medical terminology
            Always structure your response in clear sections with proper spacing.`
        },
        { role: "system", content: contextMessage },
        { role: "user", content: message }
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    // Format the response using the formatting function
    const botResponse = formatResponse(completion.choices[0].message.content);

    // Save the conversation
    const chatMessage = new ChatMessage({
      userId,
      message,
      response: botResponse,
      category: determineCategoryFromMessage(message),
      timestamp: new Date()
    });

    await chatMessage.save();

    res.status(201).json({ 
      success: true, 
      response: botResponse 
    });

  } catch (error) {
    console.error('Chat error:', error);
    handleChatError(error, res);
  }
};

// Helper function to categorize messages
function determineCategoryFromMessage(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('doctor') || lowerMessage.includes('appointment')) {
    return 'doctor_inquiry';
  } else if (lowerMessage.includes('lab') || lowerMessage.includes('test')) {
    return 'laboratory';
  } else if (lowerMessage.includes('medicine') || lowerMessage.includes('prescription')) {
    return 'medicine';
  }
  return 'general';
}

// Enhanced error handling
function handleChatError(error, res) {
  if (error.error?.type === 'insufficient_quota') {
    return res.status(429).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      error: 'API quota exceeded'
    });
  }
  
  if (error.response?.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
  
  if (error.response?.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  res.status(500).json({ 
    success: false, 
    message: error.message || 'Error processing your request' 
  });
}

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const history = await ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
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
  chatWithBot,
  getChatHistory
};