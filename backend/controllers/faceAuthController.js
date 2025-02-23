const tf = require('@tensorflow/tfjs-node');
const faceapi = require('@tensorflow-models/face-detection');
const FaceAuth = require('../models/faceAuthModel');
const PatientModel = require('../models/patientModel');
const jwt = require('jsonwebtoken');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');

let model = null;

// Initialize face detection model
const initializeModel = async () => {
  try {
    await tf.ready();
    model = await faceapi.createDetector(
      faceapi.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: 'tfjs',
        modelType: 'short'
      }
    );
    console.log('Face detection model loaded successfully');
  } catch (error) {
    console.error('Error loading face detection model:', error);
  }
};

// Initialize model when the server starts
initializeModel();

// Process face image and get embeddings
const processFaceImage = async (base64Image) => {
  if (!model) throw new Error('Face detection model not initialized');

  let tensors = [];
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Process image with sharp
    const processedBuffer = await sharp(imageBuffer)
      .resize(640, 480)
      .removeAlpha()
      .raw()
      .toBuffer();

    // Create tensor from raw pixel data
    const pixels = new Float32Array(processedBuffer.length);
    for (let i = 0; i < processedBuffer.length; i++) {
      pixels[i] = processedBuffer[i] / 255.0;
    }

    // Create the input tensor with correct shape
    const inputTensor = tf.tensor(pixels, [1, 480, 640, 3]);
    tensors.push(inputTensor);

    // Detect faces
    const predictions = await model.detectFaces(inputTensor);

    if (!predictions || predictions.length === 0) {
      throw new Error('No face detected in the image');
    }

    // Extract face data
    const detection = predictions[0];
    return {
      box: detection.box ? {
        xMin: Math.round(detection.box.xMin),
        yMin: Math.round(detection.box.yMin),
        xMax: Math.round(detection.box.xMax),
        yMax: Math.round(detection.box.yMax),
      } : null,
      landmarks: detection.keypoints ? 
        detection.keypoints.map(kp => ({ 
          x: Math.round(kp.x), 
          y: Math.round(kp.y) 
        })) : 
        []
    };
  } catch (error) {
    console.error('Error processing face image:', error);
    throw error;
  } finally {
    // Clean up tensors
    tensors.forEach(tensor => {
      if (tensor && tensor.dispose) {
        tensor.dispose();
      }
    });
  }
};

// Compare face embeddings with improved accuracy
const compareFaces = (face1, face2) => {
  try {
    if (!face1.box || !face2.box || !face1.landmarks || !face2.landmarks) {
      return false;
    }

    // Calculate box similarity
    const boxDiff = Math.abs(
      (face1.box.xMax - face1.box.xMin) * (face1.box.yMax - face1.box.yMin) -
      (face2.box.xMax - face2.box.xMin) * (face2.box.yMax - face2.box.yMin)
    );

    // Calculate landmarks similarity
    const landmarksDiff = face1.landmarks.reduce((acc, landmark, i) => {
      const dx = landmark.x - face2.landmarks[i].x;
      const dy = landmark.y - face2.landmarks[i].y;
      return acc + Math.sqrt(dx * dx + dy * dy);
    }, 0) / face1.landmarks.length;

    // Combined similarity score (adjust thresholds as needed)
    const boxThreshold = 5000;  // Increased for better tolerance
    const landmarkThreshold = 100;  // Increased for better tolerance

    return boxDiff < boxThreshold && landmarksDiff < landmarkThreshold;
  } catch (error) {
    console.error('Error comparing faces:', error);
    return false;
  }
};

exports.registerFace = async (req, res) => {
  try {
    const { userId, faceData } = req.body;

    if (!userId || !faceData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const faceEmbeddings = await processFaceImage(faceData);
    
    let faceAuth = await FaceAuth.findOne({ userId });
    
    if (faceAuth) {
      faceAuth.faceData = JSON.stringify(faceEmbeddings);
      await faceAuth.save();
    } else {
      faceAuth = new FaceAuth({
        userId,
        faceData: JSON.stringify(faceEmbeddings)
      });
      await faceAuth.save();
    }

    res.status(200).json({
      success: true,
      message: 'Face registered successfully'
    });
  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyFace = async (req, res) => {
  try {
    const { faceData } = req.body;

    if (!faceData) {
      return res.status(400).json({ error: 'Face data is required' });
    }

    const loginFaceEmbeddings = await processFaceImage(faceData);
    const registeredFaces = await FaceAuth.find().populate('userId');

    let matchedUser = null;

    for (const face of registeredFaces) {
      const storedEmbeddings = JSON.parse(face.faceData);
      
      if (compareFaces(loginFaceEmbeddings, storedEmbeddings)) {
        matchedUser = face.userId;
        face.lastUsed = new Date();
        await face.save();
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ error: 'Face not recognized' });
    }

    const token = jwt.sign(
      { userId: matchedUser._id, role: matchedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      verified: true,
      token,
      user: {
        userId: matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role
      }
    });
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({ error: error.message });
  }
};