const PatientModel = require("../../models/patientModel");
const generateAdmissionNumber = require("../../utils/admissionNumberGenerator");
const dayjs = require("dayjs");
const { cloudinary } = require("../../middleware/upload");

const getPatientProfile = async (req, res) => {
  const { email } = req.user;
  try {
    let patient = await PatientModel.findOne({ email });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Ensure patient has a profile structure even if some fields are missing
    const profile = {
      patientId: patient._id,
      email: patient.email,
      name: patient.name || "",
      dateOfBirth: patient.dateOfBirth || null,
      gender: patient.gender || "",
      weight: patient.weight || 0,
      height: patient.height || 0,
      isProfileComplete: patient.isProfileComplete || false,
      profilePhoto: patient.profilePhoto || "",
      address: patient.address || "",
      district: patient.district || "",
      city: patient.city || "",
      pincode: patient.pincode || "",
      phone: patient.phone || "",
      isProfileComplete: patient.isProfileComplete || "",
    };

    res.status(201).json({ data: profile });
    // res.status(201).json({
    //   patientId: patient._id,
    //   email: patient.email,
    //   name: patient.name || "",
    //   dateOfBirth: patient.dateOfBirth || null,
    //   gender: patient.gender || "",
    //   weight: patient.weight || 0,
    //   height: patient.height || 0,
    //   isProfileComplete: patient.isProfileComplete || false,
    //   profilePhoto: patient.profilePhoto || "",
    // });
    // res.status(201).json({ patient });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// UPDATE patient profile by email
const updatePatientProfile = async (req, res) => {
  const {name, email, dateOfBirth, gender, weight, height, address, district , city, pincode, phone} = req.body;
  console.log(req.body);

  try {
    const patient = await PatientModel.findOne({ email });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update personal info fields
    patient.dateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : patient.dateOfBirth;
    patient.gender = gender || patient.gender;
    patient.weight = weight || patient.weight;
    patient.height = height || patient.height;
    patient.name = name || patient.name;
    patient.address= address || patient.address;
    patient.district= district || patient.district;
    patient.city = city || patient.city;
    patient.pincode = pincode || patient.pincode;
    patient.phone = phone || patient.phone;

     // Check if all required fields are filled
     const requiredFields = [
      'name',
      'dateOfBirth',
      'gender',
      'weight',
      'height',
      'address',
      'district',
      'city',
      'pincode',
      'phone'
    ];

    const isComplete = requiredFields.every(field => {
      const value = patient[field];
      return value !== null && value !== undefined && value !== '';
    });

    // Update isProfileComplete based on the check
    patient.isProfileComplete = isComplete;

    // Mark profile as complete and generate admission number if not already set
    if (!patient.isProfileComplete) {
      patient.isProfileComplete = true;

      if (!patient.admissionNumber) {
        let admissionNumber = generateAdmissionNumber();
        let isUnique = false;

        while (!isUnique) {
          const existingProfile = await PatientModel.findOne({
            admissionNumber,
          });
          if (!existingProfile) {
            isUnique = true;
          } else {
            admissionNumber = generateAdmissionNumber();
          }
        }

        patient.admissionNumber = admissionNumber;
      }
    }

    await patient.save();

    res.status(201).json({
      message: "Profile updated successfully",
      profile: patient,
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const uploadPatientProfilePhoto = async (req,res) =>{
   try{
    if(!req.file){
      return res.status(400).json({ message: 'No file uploaded'});
    }
   
    const { email } = req.body;
    if(!email){
      return res.status(400).json( { message: 'Email is Rewuired'});
    }
    
    const patient = await PatientModel.findOne({ email });
 
    if(!patient){
      if(req.file.path){
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({ message: "Patient not Found" });
    }
    
    if(patient.profilePhoto){
      try{
      const publicId = patientProfileUpload.profilePhoto.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch(deleteError){
      console.error('Error deleting old images', deleteError);
    }
    }
   
   patient.profilePhoto = req.file.path;
   await patient.save();
   console.log("Patient Profile Photo Uploaded successfully");
  
   res.status(201).json({
    success: true,
    message: "Profile Photo Uploaded Successfully",
    profilePhoto: patient.profilePhoto,
   });
  
  } catch(error){
    if(req.file && req.file.path){
      try{
        await cloudinary.uploader.destroy(req.file.filename);

      }catch(cleanupError){
        console.error('Error upload Photo', cleanupError);
      }
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

module.exports = { getPatientProfile, updatePatientProfile, uploadPatientProfilePhoto};
