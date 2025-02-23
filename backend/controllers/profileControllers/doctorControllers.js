const DoctorModel = require("../../models/doctorModel");
const { cloudinary } = require("../../middleware/upload");

const getDoctorProfile = async (req, res) => {
  const email = req.user.email;
  try {
    const doctor = await DoctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(201).json({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      gender: doctor.gender,
      profilePhoto: doctor.profilePhoto || "", // This will now be a Cloudinary URL
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const uploadDoctorProfilePhoto = async (req, res) => {
  try {
    console.log("Hit in controllers for doctor profile picture");
    console.log('Request received in controller');
    console.log('Files:', req.file);
    console.log('Body:', req.body);
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { email } = req.body;
    if (!email) {
      console.log("No email in request body");
      return res.status(400).json({ message: 'Email is required' });
    }

    const doctor = await DoctorModel.findOne({ email });
    
    if (!doctor) {
      console.log("Doctor not found for email:", email);
      if (req.file.path) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({ message: "Doctor not found" });
    }

    // If there's an existing profile photo, delete it from Cloudinary
    if (doctor.profilePhoto) {
      try {
        const publicId = doctor.profilePhoto.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    // Update doctor with new Cloudinary URL
    doctor.profilePhoto = req.file.path;
    await doctor.save();

    console.log('Profile photo updated successfully:', doctor.profilePhoto);

    res.status(201).json({
      success: true,
      message: "Profile photo uploaded successfully",
      profilePhoto: doctor.profilePhoto,
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && req.file.path) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message 
    });
  }
};

const updateDoctorProfile = async (req, res) => {
  const {firstName,lastName, email, phone, gender} = req.body;

  try {
    const doctor = await DoctorModel.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update personal info fields
    doctor.firstName = firstName ||doctor.firstName;
    doctor.lastName = lastName ||doctor.lastName;
    doctor.gender = gender || doctor.gender;
    doctor.phone = phone || doctor.phone;
    

    await doctor.save();

    res.status(201).json({
      message: "Profile updated successfully",
      profile: doctor,
    });
  } catch (error) {
    console.error("Error updating  Profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getDoctorProfile, uploadDoctorProfilePhoto ,updateDoctorProfile};