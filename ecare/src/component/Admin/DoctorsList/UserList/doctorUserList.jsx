import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Switch,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import styles from "./doctorUserList.module.css";
import PageTitle from "../../../Common/PageTitle";

const DoctorUserList = ({
  fetchDoctors,
  toggleDoctorStatus,
  editDoctorDetails,
  registerDoctor,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const fetchedDoctors = await fetchDoctors();
      setDoctors(
        fetchedDoctors.map((doctor) => ({
          ...doctor,
          isDisabled: doctor.isDisabled || false,
        }))
      );
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Error fetching doctors");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await toggleDoctorStatus(id, updatedStatus);
      setDoctors(
        doctors.map((doctor) =>
          doctor._id === id ? { ...doctor, isDisabled: updatedStatus } : doctor
        )
      );
      toast.success(
        `Doctor ${updatedStatus ? "disabled" : "enabled"} successfully`
      );
    } catch (error) {
      console.error("Error updating doctor status:", error);
      toast.error("Error updating doctor status");
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor({ ...doctor });
    setOpenEditModal(true);
  };

  const handleSave = async () => {
    try {
      await editDoctorDetails(editingDoctor._id, editingDoctor);
      setDoctors(
        doctors.map((doctor) =>
          doctor._id === editingDoctor._id ? editingDoctor : doctor
        )
      );
      setOpenEditModal(false);
      setEditingDoctor(null);
      toast.success("Doctor details updated successfully");
    } catch (error) {
      toast.error("Error updating doctor details");
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      `${doctor.firstName} ${doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.doctorUserListContainer}>
      <PageTitle>Doctors Management</PageTitle>

      <div className={styles.toolbar}>
        <TextField
          placeholder="Search doctors..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          className={styles.searchField}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={registerDoctor}
          className={styles.registerButton}
        >
          Register New Doctor
        </Button>
      </div>

      <Grid container spacing={3} className={styles.doctorGrid}>
        {filteredDoctors.map((doctor) => (
          <Grid item xs={12} md={6} lg={4} key={doctor._id}>
            <Card className={styles.doctorCard}>
              <CardContent>
                <div className={styles.cardHeader}>
                  {doctor.profilePhoto ? (
                    <Avatar
                      className={styles.avatar}
                      src={`http://localhost:5001/src/assets/doctorProfile/${doctor.profilePhoto}`}
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                    />
                  ) : (
                    <Avatar className={styles.avatar}>
                      {doctor.firstName.charAt(0)}
                    </Avatar>
                  )}
                  <Switch
                    checked={!doctor.isDisabled}
                    onChange={() => handleToggle(doctor._id, doctor.isDisabled)}
                    color="primary"
                  />
                </div>

                <Typography variant="h6" className={styles.doctorName}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {doctor.specialization}
                </Typography>

                <div className={styles.doctorInfo}>
                  <Typography variant="body2">
                    <strong>Experience:</strong> {doctor.y_experience} years
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {doctor.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {doctor.phone}
                  </Typography>
                </div>

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(doctor)}
                  className={styles.editButton}
                >
                  Edit Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Doctor Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                value={editingDoctor?.firstName || ""}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    firstName: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                value={editingDoctor?.lastName || ""}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    lastName: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <Select
                label="Specialization"
                value={editingDoctor?.specialization || ""}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    specialization: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              >
                <MenuItem value="">Select Specialization</MenuItem>
                <MenuItem value="General Medicine">General Medicine</MenuItem>
                <MenuItem value="Dermatology">Dermatology</MenuItem>
                <MenuItem value="Gynecology">Gynecology</MenuItem>
                <MenuItem value="Neurology">Neurology</MenuItem>
                <MenuItem value="Gastroenterology">Gastroenterology</MenuItem>
                <MenuItem value="General Surgery">General Surgery</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Years of Experience"
                value={editingDoctor?.y_experience || ""}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    y_experience: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone"
                value={editingDoctor?.phone || ""}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, phone: e.target.value })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                type="email"
                value={editingDoctor?.email || ""}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, email: e.target.value })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <Select
                label="Gender"
                value={editingDoctor?.gender || ""}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, gender: e.target.value })
                }
                fullWidth
                margin="normal"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                type="password"
                value={editingDoctor?.password || ""}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    password: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About Doctor"
                multiline
                rows={4}
                value={editingDoctor?.aboutDoctor || ""}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    aboutDoctor: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DoctorUserList;
