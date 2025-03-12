const {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const PatientModel = require("../models/patientModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "midhun12345";

// Update these settings for cross-platform compatibility
const rpName = "ECare";
const rpID = "localhost"; // Your domain in production
const origin = `http://${rpID}:5173`;

// Helper function to convert string to Uint8Array
const stringToUint8Array = (str) => {
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
};

const challenges = new Map(); // In-memory challenge storage
const authenticationChallenges = new Map(); // Add this new Map for authentication challenges

exports.generateRegistrationOptions = async (req, res) => {
  const { userId, email } = req.body;
  console.log("reqqqq", req.body);

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userIdBuffer = Buffer.from(userId);

    const options = await generateRegistrationOptions({
      rpName,
      rpID: "mediclouds.netlify.app", // Update this to match your domain
      userID: userIdBuffer,
      userName: email,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: undefined,
        requireResidentKey: false,
        userVerification: "preferred",
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    // Store the challenge with the userId as the key
    challenges.set(userId, options.challenge);

    // Set challenge cleanup timeout (5 minutes)
    setTimeout(() => {
      challenges.delete(userId);
    }, 5 * 60 * 1000);

    // Convert challenge to base64url for the client
    const modifiedOptions = {
      ...options,
      challenge: Buffer.from(options.challenge).toString("base64url"),
      user: {
        ...options.user,
        id: Buffer.from(options.user.id).toString("base64url"),
      },
    };

    res.status(201).json({ options: modifiedOptions });
  } catch (error) {
    console.error("Registration options error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyRegistration = async (req, res) => {
  const { credential, userId } = req.body;
  console.log("Verification Request:", { credential, userId });

  try {
    // Get the challenge from our Map using userId
    const expectedChallenge = challenges.get(userId);
    
    if (!credential || !expectedChallenge) {
      console.error("Missing credential or challenge");
      return res.status(400).json({
        error: "Missing required verification data",
        credential: !!credential,
        challenge: !!expectedChallenge,
      });
    }

    // Clean up the challenge
    challenges.delete(userId);

    const verification = await verifyRegistrationResponse({
      response: {
        ...credential,
        // Ensure authenticatorData is included
        authenticatorData: credential.response.authenticatorData,
      },
      expectedChallenge: Buffer.from(expectedChallenge).toString("base64url"),
      expectedOrigin: "https://mediclouds.netlify.app",
      expectedRPID: "mediclouds.netlify.app",
    });

    console.log("Verification Result:", verification);

    if (verification.verified) {
      // Convert Uint8Array to Buffer for storage
      const credentialID = credential.id;
      const publicKeyBuffer = Buffer.from(verification.registrationInfo.credentialPublicKey);

      // Log the credential being stored
      console.log("Storing credential:", {
        credentialID,
        publicKeyLength: publicKeyBuffer.length
      });

      const user = await PatientModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            biometricCredentials: {
              credentialID: credentialID,
              publicKey: publicKeyBuffer,
              counter: verification.registrationInfo.counter,
              credentialDeviceType: verification.registrationInfo.credentialDeviceType,
              credentialBackedUp: verification.registrationInfo.credentialBackedUp,
              transports: credential.response.transports || [],
              fmt: verification.registrationInfo.fmt,
              aaguid: verification.registrationInfo.aaguid,
            },
          },
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(201).json({
        verified: true,
        message: "Biometric registration successful",
        credentialId: credentialID,
        deviceType: verification.registrationInfo.credentialDeviceType,
        isBackedUp: verification.registrationInfo.credentialBackedUp,
      });
    } else {
      res.status(400).json({
        error: "Verification failed",
        message: "The biometric registration could not be verified",
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      error: error.message,
      details: {
        hasCredential: !!req.body.credential,
        hasChallenge: !!challenges.get(userId),
        origin: "https://mediclouds.netlify.app",
        rpID: "mediclouds.netlify.app",
      },
    });
  }
};

exports.generateAuthenticationOptions = async (req, res) => {
  try {
    // Get all registered credentials from the database
    const users = await PatientModel.find({
      biometricCredentials: { $exists: true, $not: { $size: 0 } },
    });

    console.log("Found users with credentials:", users.length);

    // Format credentials for the authenticator
    const allowCredentials = users.reduce((acc, user) => {
      const credentials = user.biometricCredentials
        .map((cred) => {
          try {
            return {
              id: Buffer.from(cred.credentialID, "base64url"),
              type: "public-key",
              transports: cred.transports || ["internal"],
            };
          } catch (error) {
            console.error("Error converting credential ID:", error);
            return null;
          }
        })
        .filter(Boolean);

      return [...acc, ...credentials];
    }, []);

    if (allowCredentials.length === 0) {
      return res.status(400).json({
        error: "No registered credentials found",
      });
    }

    // Generate random bytes for challenge
    const challenge = crypto.randomBytes(32);

    const options = {
      challenge,
      allowCredentials,
      rpID: "mediclouds.netlify.app", // Update with your domain
      timeout: 60000,
      userVerification: "preferred",
    };

    // Generate a unique key for this authentication attempt
    const authId = crypto.randomBytes(32).toString('hex');
    
    // Store the challenge with the authId
    authenticationChallenges.set(authId, challenge);

    // Set cleanup timeout (5 minutes)
    setTimeout(() => {
      authenticationChallenges.delete(authId);
    }, 5 * 60 * 1000);

    // Format the response for the client
    const clientOptions = {
      ...options,
      challenge: Buffer.from(challenge).toString("base64url"),
      allowCredentials: options.allowCredentials.map((cred) => ({
        ...cred,
        id: cred.id.toString("base64url"),
      })),
    };

    res.json({
      options: clientOptions,
      authId, // Send this to the client
    });
  } catch (error) {
    console.error("Error generating authentication options:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyAuthentication = async (req, res) => {
  let storedCredential = null;
  try {
    const { credential } = req.body;
    console.log("Received credential:", JSON.stringify(credential, null, 2));

    // Check if credential and its response are defined
    if (!credential || !credential.response) {
      return res.status(400).json({ 
        error: 'Missing credential or response',
        details: {
          hasCredential: !!credential,
          hasResponse: !!credential?.response,
          // authId
        }
      });
    }

    // Check if authenticatorData is defined
    // if (!credential.response.authenticatorData) {
    //   return res.status(400).json({ 
    //     error: 'Missing authenticatorData in response',
    //     authId
    //   });
    // }

    // Get the challenge using authId
    // const expectedChallenge = authenticationChallenges.get(authId);

    // if (!expectedChallenge) {
    //   return res.status(400).json({ 
    //     error: 'Missing challenge',
    //     authId
    //   });
    // }

    // Clean up the challenge
    // authenticationChallenges.delete(authId);

    // Find user by credential ID
    const user = await PatientModel.findOne({
      'biometricCredentials.credentialID': credential.id
    });

    if (!user) {
      console.log("No user found with credential ID:", credential.id);
      return res.status(404).json({ 
        error: 'No matching credential found'
      });
    }

    storedCredential = user.biometricCredentials.find(
      cred => cred.credentialID === credential.id
    );

    if (!storedCredential) {
      return res.status(404).json({ 
        error: 'Credential not found in user record'
      });
    }

    // Convert Binary public key to Buffer
    let publicKeyBuffer;
    if (storedCredential.publicKey instanceof Buffer) {
      publicKeyBuffer = storedCredential.publicKey;
    } else if (storedCredential.publicKey.buffer) {
      publicKeyBuffer = Buffer.from(storedCredential.publicKey.buffer);
    } else {
      publicKeyBuffer = Buffer.from(storedCredential.publicKey.toString('base64'), 'base64');
    }

    // Prepare verification data
    const verificationData = {
      response: {
        authenticatorData: credential.response.authenticatorData,
        clientDataJSON: credential.response.clientDataJSON,
        signature: credential.response.signature,
        userHandle: credential.response.userHandle
      },
      expectedChallenge: Buffer.from(expectedChallenge).toString('base64url'),
      expectedOrigin: "https://mediclouds.netlify.app",
      expectedRPID: "mediclouds.netlify.app",
      authenticator: {
        credentialPublicKey: publicKeyBuffer,
        credentialID: Buffer.from(storedCredential.credentialID, 'base64url'),
        counter: storedCredential.counter || 0
      },
      requireUserVerification: false
    };

    console.log('Verification data:', {
      ...verificationData,
      authenticator: {
        ...verificationData.authenticator,
        credentialPublicKey: '<buffer>',
      }
    });

    const verification = await verifyAuthenticationResponse(verificationData);

    if (verification.verified) {
      // Update the counter
      await PatientModel.updateOne(
        { 
          _id: user._id,
          'biometricCredentials.credentialID': credential.id 
        },
        { 
          $set: { 
            'biometricCredentials.$.counter': verification.authenticationInfo.newCounter 
          } 
        }
      );

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        verified: true,
        token,
        data: {
          email: user.email,
          role: user.role,
          name: user.name,
          id: user._id,
        }
      });
    } else {
      res.status(400).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error('Authentication verification error:', error);
    res.status(500).json({ 
      error: error.message,
      details: {
        hasCredential: !!req.body.credential,
        hasChallenge: !!authenticationChallenges.size,
        storedCredential: !!storedCredential,
        credentialResponse: req.body.credential?.response
      }
    });
  }
};