import React from 'react';
import { useNavigate } from "react-router-dom";
import DoctorUserList from './UserList';
import { getDoctors } from '../../../services/adminServices';
import { toggleUserStatus, editUserDetails } from '../../../services/adminServices';
import { ROUTES } from "../../../router/routes";


const DoctorList = () => {
  const navigate = useNavigate();
  const fetchFormattedDoctors = async () => {
    const doctors = await getDoctors();
    return doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      y_experience: doctor.y_experience,
      gender: doctor.gender,
      phone: doctor.phone,
      email: doctor.email,
      date_created: doctor.date_created,
      isDisabled: doctor.isDisabled,
      aboutDoctor: doctor.aboutDoctor,
      password: doctor.password,
      profilePhoto: doctor.profilePhoto,
    }));
  };

  return (
    <DoctorUserList
      fetchDoctors={fetchFormattedDoctors}
      toggleDoctorStatus={(id, status) => toggleUserStatus('doctor', id, status)}
      editDoctorDetails={(id, data) => editUserDetails('doctor', id, data)}
      registerDoctor={() => navigate(ROUTES.DOCTOR_REGISTER)}
    />
  );
};

export default DoctorList;
