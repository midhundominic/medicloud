const CoordinatorModel = require("../../models/coordinatorModel");

const getCoordinatorProfile = async (req, res) => {
  const email = req.user.email; 

  try {
    const coordinator = await CoordinatorModel.findOne({ email });

    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    res.status(201).json(coordinator);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateCoordinatorProfile = async (req, res) => {
  const coordinatorId = req.user._id;
  const { firstName, lastName, gender, email, phone } = req.body;

  try {
    const coordinator = await CoordinatorModel.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    // Update profile fields
    coordinator.firstName = firstName;
    coordinator.lastName = lastName;
    coordinator.gender = gender;
    coordinator.email = email;
    coordinator.phone = phone;

    await coordinator.save();

    res.status(201).json(coordinator);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getCoordinatorProfile,
  updateCoordinatorProfile,
};
