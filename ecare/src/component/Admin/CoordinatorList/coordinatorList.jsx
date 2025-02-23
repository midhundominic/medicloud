import React from 'react';
import { useNavigate } from "react-router-dom";
import CoordinatorUserList from './UserList';
import { getCoordinator } from '../../../services/coordinatorServices';
import { toggleUserStatus, editUserDetails } from '../../../services/adminServices';
import { ROUTES } from "../../../router/routes";

const CoordinatorList = () => {
  const navigate = useNavigate();

  const fetchFormattedCoordinators = async () => {
    const coordinators = await getCoordinator();
    return coordinators.map(coordinator => ({
      _id: coordinator._id,
      firstName: coordinator.firstName,
      lastName: coordinator.lastName,
      gender: coordinator.gender,
      email: coordinator.email,
      phone: coordinator.phone,
      date_created: coordinator.date_created,
      isDisabled: coordinator.isDisabled
    }));
  };

  return (
    <CoordinatorUserList
      fetchCoordinators={fetchFormattedCoordinators}
      toggleCoordinatorStatus={(id, status) => toggleUserStatus('coordinator', id, status)}
      editCoordinatorDetails={(id, data) => editUserDetails('coordinator', id, data)}
      registerCoordinator={() => navigate(ROUTES.COORDINATOR_REGISTER)}
    />
  );
};

export default CoordinatorList;
