import React from 'react';
import UserList from './UserList';
import { getPatients } from '../../../services/patientServices';
import { toggleUserStatus, editUserDetails } from '../../../services/adminServices';

const PatientList = () => {
  const fetchFormattedPatients = async () => {
    const patients = await getPatients();
    return patients.map(patient => ({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      isDisabled: patient.isDisabled,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      date_created: patient.date_created,
    }));
  };

  return (
    <UserList 
      userType="patient"
      fetchUsers={fetchFormattedPatients}
      toggleUserStatus={(id, status) => toggleUserStatus('patient', id, status)}
      editUserDetails={(id, data) => editUserDetails('patient', id, data)}
    />
  );
};

export default PatientList;
