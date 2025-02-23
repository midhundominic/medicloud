const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeHealthMetrics = (data) => {
  const risks = [];
  const recommendations = [];

  // Blood Sugar Analysis
  if (data.bloodSugar > 140) {
    risks.push('High blood sugar levels');
    recommendations.push('Monitor carbohydrate intake');
  }

  // Blood Pressure Analysis
  if (data.systolicBP > 130 || data.diastolicBP > 80) {
    risks.push('Elevated blood pressure');
    recommendations.push('Reduce sodium intake');
  }

  // Oxygen Level Analysis
  if (data.oxygenLevel < 95) {
    risks.push('Low oxygen saturation');
    recommendations.push('Consider deep breathing exercises');
  }

  return { risks, recommendations };
};

exports.analyzeHealth = async (req, res) => {
  try {
    const healthData = req.body;
    const { risks, recommendations } = analyzeHealthMetrics(healthData);

    const prompt = `As a medical professional, analyze the following health metrics:
      Blood Sugar: ${healthData.bloodSugar} mg/dL
      Blood Pressure: ${healthData.systolicBP}/${healthData.diastolicBP} mmHg
      Oxygen Level: ${healthData.oxygenLevel}%
      Temperature: ${healthData.temperature}°F
      
      Identified risks: ${risks.join(', ')}
      
      Please provide a detailed health assessment and recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a knowledgeable and compassionate doctor with expertise in chronic disease management. Communicate in a clear, professional, yet friendly manner."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiAnalysis = completion.choices[0].message.content;

    return res.json({
      success: true,
      result: {
        metrics: healthData,
        risks,
        recommendations,
        aiAnalysis,
        urgentCare: risks.length > 2 ? "Please consult your healthcare provider soon." : null
      }
    });
  } catch (error) {
    console.error('Health analysis error:', error);
    return res.status(500).json({
      message: 'Error analyzing health data',
      error: error.message
    });
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    const prompt = `Previous context: ${context}
    
    Patient's question: ${message}
    
    Please provide a helpful and accurate response.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a virtual health assistant with expertise in chronic disease management. Provide accurate, helpful information while maintaining a professional and empathetic tone. If the question requires immediate medical attention, advise the patient to contact their healthcare provider."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return res.json({
      success: true,
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      message: 'Error processing chat message',
      error: error.message
    });
  }
};