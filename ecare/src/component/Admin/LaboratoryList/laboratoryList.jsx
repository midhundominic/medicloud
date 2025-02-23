import React from 'react';
import UserList from './UserList';
import { getAllLaboratory } from '../../../services/pharmacyServices';
import { toggleUserStatus, editUserDetails } from '../../../services/adminServices';
import { ROUTES } from "../../../router/routes";
import { useNavigate } from 'react-router-dom';

const Laboratory = () => {
  const navigate = useNavigate();
  const fetchFormattedLaboratory = async () => {
    try {
      const response = await getAllLaboratory();
      // Check if response.data exists and is an array
      const laboratoryData = response?.data || [];
      
      return laboratoryData.map(laboratory => ({
        _id: laboratory._id,
        name: laboratory.name,
        email: laboratory.email,
        isDisabled: laboratory.isDisabled,
        date_created: laboratory.date_created,
      }));
    } catch (error) {
      console.error("Error in fetchFormattedLaboratory:", error);
    }
  };

  return (
    <UserList 
      userType="laboratory"
      fetchUsers={fetchFormattedLaboratory}
      toggleUserStatus={(id, status) => toggleUserStatus('laboratory', id, status)}
      editUserDetails={(id, data) => editUserDetails('laboratory', id, data)}
      registerLaboratory={() => navigate(ROUTES.LABORATORY_REGISTRATION)}
    />
  );
};

export default Laboratory;
