import React, { useState, useEffect } from "react";
import { Switch, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import styles from "./coordinatorUserList.module.css";
import PageTitle from '../../../Common/PageTitle';

const CoordinatorUserList = ({ fetchCoordinators, toggleCoordinatorStatus, editCoordinatorDetails, registerCoordinator }) => {
  const [coordinators, setCoordinators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCoordinator, setEditingCoordinator] = useState(null);

  useEffect(() => {
    loadCoordinators();
  }, []);

  const loadCoordinators = async () => {
    try {
      const fetchedCoordinators = await fetchCoordinators();
      setCoordinators(fetchedCoordinators.map(coordinator => ({ ...coordinator, isDisabled: coordinator.isDisabled || false })));
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      toast.error("Error fetching coordinators");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await toggleCoordinatorStatus(id, updatedStatus);
      setCoordinators(coordinators.map(coordinator => coordinator._id === id ? { ...coordinator, isDisabled: updatedStatus } : coordinator));
      toast.success(`Coordinator ${updatedStatus ? "disabled" : "enabled"} successfully`);
    } catch (error) {
      console.error("Error updating coordinator status:", error);
      toast.error("Error updating coordinator status");
    }
  };

  const handleEdit = (coordinator) => setEditingCoordinator({ ...coordinator });

  const handleSave = async () => {
    try {
      await editCoordinatorDetails(editingCoordinator._id, editingCoordinator);
      setCoordinators(coordinators.map(coordinator => coordinator._id === editingCoordinator._id ? editingCoordinator : coordinator));
      setEditingCoordinator(null);
      toast.success("Coordinator details updated successfully");
    } catch (error) {
      toast.error("Error updating coordinator details");
    }
  };

  const filteredCoordinators = coordinators.filter(
    coordinator =>
      `${coordinator.firstName} ${coordinator.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.coordinatorUserListContainer}>
      <div className={styles.searchContainer}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchField}
        />
        <Button variant="contained" color="primary" onClick={registerCoordinator} className={styles.registerButton}>
          Register Coordinator
        </Button>
      </div>
      <PageTitle>Coordinators</PageTitle>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Password</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCoordinators.map(coordinator => (
            <TableRow key={coordinator._id}>
              <TableCell>{editingCoordinator && editingCoordinator._id === coordinator._id ? (
                <>
                  <TextField
                    value={editingCoordinator.firstName}
                    onChange={(e) => setEditingCoordinator({ ...editingCoordinator, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                  <TextField
                    value={editingCoordinator.lastName}
                    onChange={(e) => setEditingCoordinator({ ...editingCoordinator, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </>
              ) : `${coordinator.firstName} ${coordinator.lastName}`}</TableCell>
              <TableCell>{editingCoordinator && editingCoordinator._id === coordinator._id ? (
                <TextField
                  value={editingCoordinator.email}
                  onChange={(e) => setEditingCoordinator({ ...editingCoordinator, email: e.target.value })}
                />
              ) : coordinator.email}</TableCell>
              <TableCell>{editingCoordinator && editingCoordinator._id === coordinator._id ? (
                <Select
                  value={editingCoordinator.gender}
                  onChange={(e) => setEditingCoordinator({ ...editingCoordinator, gender: e.target.value })}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              ) : coordinator.gender}</TableCell>
              <TableCell>{editingCoordinator && editingCoordinator._id === coordinator._id ? (
                <TextField
                  value={editingCoordinator.phone}
                  onChange={(e) => setEditingCoordinator({ ...editingCoordinator, phone: e.target.value })}
                />
              ) : coordinator.phone}</TableCell>
              <TableCell>{editingCoordinator && editingCoordinator._id === coordinator._id ? (
                <TextField
                  value={editingCoordinator.password}
                  onChange={(e) => setEditingCoordinator({ ...editingCoordinator, password: e.target.value })}
                  type="password"
                />
              ) : "********"}</TableCell>
              <TableCell>{coordinator.date_created ? new Date(coordinator.date_created).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>
                {editingCoordinator && editingCoordinator._id === coordinator._id ? (
                  <>
                    <Button onClick={handleSave} variant="contained" color="primary" size="small">
                      Save
                    </Button>
                    <Button onClick={() => setEditingCoordinator(null)} variant="outlined" color="secondary" size="small">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEdit(coordinator)}>
                      <EditIcon />
                    </IconButton>
                    <Switch
                      checked={!coordinator.isDisabled}
                      onChange={() => handleToggle(coordinator._id, coordinator.isDisabled)}
                      color="primary"
                    />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CoordinatorUserList;
