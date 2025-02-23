const ReviewModel = require("../models/reviewModel");
const DoctorModel = require('../models/doctorModel');

const submitReview = async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.params;
    const { patientId, rating, review } = req.body;

    const newReview = new ReviewModel({
      appointmentId,
      doctorId,
      patientId,
      rating,
      review,
      isSubmitted:true,
    });

    await newReview.save();

    // Update doctor's average rating
    const reviews = await ReviewModel.find({ doctorId });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await DoctorModel.findByIdAndUpdate(doctorId, { rating: averageRating });

    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Error submitting review" });
  }
};

const getSubmittedReviews = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const reviews = await ReviewModel.find({ patientId })
      .populate('appointmentId')
      .populate('doctorId', 'firstName lastName')
      .select('rating review isSubmitted createdAt'); 
    
    res.status(201).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching submitted reviews:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching submitted reviews" 
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.find()
      .populate('appointmentId')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.status(201).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching reviews" 
    });
  }
};

module.exports = { submitReview, getSubmittedReviews, getAllReviews };



