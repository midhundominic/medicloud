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
// Update rpID to match your deployed domain
const rpID = process.env.NODE_ENV === 'production' 
  ? "mediclouds.netlify.app"
  : "localhost";

// Update origin based on environment
const origin = process.env.NODE_ENV === 'production'
  ? "https://mediclouds.netlify.app"
  : "http://localhost:5173";

// At the top of the file, add this temporary challenge store
const challengeStore = new Map();

// Helper function to convert string to Uint8Array
const stringToUint8Array = (str) => {
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
};

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
      rpID,
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

    // Store the challenge with the userId as key
    challengeStore.set(userId, options.challenge);
    
    // Set cleanup timeout (5 minutes)
    setTimeout(() => challengeStore.delete(userId), 5 * 60 * 1000);

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
    const expectedChallenge = challengeStore.get(userId);
    
    if (!credential || !expectedChallenge) {
      console.error("Missing credential or challenge");
      return res.status(400).json({
        error: "Missing required verification data",
        credential: !!credential,
        challenge: !!expectedChallenge,
      });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: Buffer.from(expectedChallenge).toString("base64url"),
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    // Clean up the challenge after use
    challengeStore.delete(userId);

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
        hasChallenge: !!expectedChallenge,
        origin,
        rpID,
        expectedChallenge: Buffer.from(expectedChallenge).toString(
          "base64url"
        ),
        receivedChallenge: credential?.response?.clientDataJSON,
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
              id: Buffer.from(cred.credentialID, "base64url"), // Convert to Buffer
              type: "public-key",
              transports: cred.transports || ["internal"],
            };
          } catch (error) {
            console.error("Error converting credential ID:", error);
            return null;
          }
        })
        .filter(Boolean); // Remove any null entries

      return [...acc, ...credentials];
    }, []);

    // Log the credentials for debugging
    console.log(
      "Formatted credentials:",
      allowCredentials.map((c) => ({
        ...c,
        id: c.id.toString("base64url"),
        idBuffer: Buffer.isBuffer(c.id),
      }))
    );

    if (allowCredentials.length === 0) {
      return res.status(400).json({
        error: "No registered credentials found",
      });
    }

    // Generate random bytes for challenge
    const challenge = crypto.randomBytes(32);
    
    // Store the challenge with a unique ID
    const authId = crypto.randomBytes(16).toString('hex');
    challengeStore.set(authId, challenge);
    
    // Set cleanup timeout
    setTimeout(() => challengeStore.delete(authId), 5 * 60 * 1000);

    const options = {
      challenge,
      allowCredentials,
      rpID,
      timeout: 60000,
      userVerification: "preferred",
    };

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
      authId // Send this back to the client
    });
  } catch (error) {
    console.error("Error generating authentication options:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyAuthentication = async (req, res) => {
  const { credential, authId } = req.body;
  
  try {
    const expectedChallenge = challengeStore.get(authId);
    
    if (!credential || !expectedChallenge) {
      return res.status(400).json({ 
        error: 'Missing credential or challenge'
      });
    }

    // Ensure all required fields are present
    if (!credential.response.authenticatorData || 
        !credential.response.clientDataJSON || 
        !credential.response.signature) {
      return res.status(400).json({
        error: 'Missing required credential response fields'
      });
    }

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

    // Find the specific credential
    const storedCredential = user.biometricCredentials.find(
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
      publicKeyBuffer = Buffer.from(storedCredential.publicKey, 'base64');
    }

    // Prepare verification data
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: Buffer.from(expectedChallenge).toString('base64url'),
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: publicKeyBuffer,
        credentialID: Buffer.from(storedCredential.credentialID, 'base64url'),
        counter: storedCredential.counter
      },
      requireUserVerification: false
    });

    // Clean up the challenge after use
    challengeStore.delete(authId);

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

      // Set up session
      req.session.userId = user._id;
      req.session.role = user.role;
      req.session.email = user.email;

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
    console.error('Full error details:', {
      hasCredential: !!req.body.credential,
      hasResponse: !!req.body.credential?.response,
      hasAuthenticatorData: !!req.body.credential?.response?.authenticatorData,
      error: error.stack
    });

    res.status(500).json({ 
      error: error.message,
      details: {
        hasCredential: !!req.body.credential,
        hasChallenge: !!expectedChallenge,
      }
    });
  }
};